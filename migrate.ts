import admin from "firebase-admin";
import { Pool } from "pg";
import { readFileSync } from "fs";

// Read service account key
const serviceAccountPath = "./server/firebaseServiceAccountKey.json";
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

// Initialize Firebase Admin with correct configuration
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "rugcraftpro"
  });
}

const db = admin.firestore();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrateData() {
  const maxRetries = 3;
  let attempt = 0;

  // Test Firebase connection first
  try {
    console.log("🔥 Testing Firebase connection...");
    await db.collection('test').doc('connection-test').set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      test: true
    });
    console.log("✅ Firebase connection successful");

    // Clean up test document
    await db.collection('test').doc('connection-test').delete();
  } catch (error) {
    console.error("❌ Firebase connection failed:", error);
    console.error("Please check your Firebase service account key and permissions");
    process.exit(1);
  }

  while (attempt < maxRetries) {
    try {
      console.log("🚀 Starting migration from PostgreSQL to Firebase...");

      // Test PostgreSQL connection
      await pool.query('SELECT 1');
      console.log("✅ PostgreSQL connection successful");
      break; // Connection successful

    } catch (error: any) {
      attempt++;
      if (error.code === 'XX000' && attempt < maxRetries) {
        console.log(`⏳ PostgreSQL connection attempt ${attempt} failed. Retrying in 5 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }
      throw error; // Re-throw if not a connection limit error or max retries reached
    }
  }
  try {
    console.log("🚀 Starting migration from PostgreSQL to Firebase...");

    // Migrate Users
    console.log("📋 Migrating users...");
    const usersRes = await pool.query("SELECT * FROM users");
    console.log(`Found ${usersRes.rows.length} users to migrate`);

    if (usersRes.rows.length > 0) {
      const usersBatch = db.batch();
      for (const user of usersRes.rows) {
        const userRef = db.collection("users").doc(user.id.toString());
        const userData: any = {
          UserId: user.id.toString(),
          Email: user.email || "",
          Role: user.role || "viewer",
          Department: user.department || "",
          isActive: user.is_active ?? true,
          permissions: user.permissions || []
        };

        // Handle timestamps safely
        if (user.last_login) {
          const lastLoginDate = new Date(user.last_login);
          if (!isNaN(lastLoginDate.getTime())) {
            userData.lastLogin = admin.firestore.Timestamp.fromDate(lastLoginDate);
          }
        }

        if (user.created_at) {
          const createdDate = new Date(user.created_at);
          if (!isNaN(createdDate.getTime())) {
            userData.createdAt = admin.firestore.Timestamp.fromDate(createdDate);
          }
        }

        if (user.updated_at) {
          const updatedDate = new Date(user.updated_at);
          if (!isNaN(updatedDate.getTime())) {
            userData.updatedAt = admin.firestore.Timestamp.fromDate(updatedDate);
          }
        }

        usersBatch.set(userRef, userData);
      }
      await usersBatch.commit();
      console.log("✅ Users migrated!");
    }

    // Migrate Materials
    console.log("📋 Migrating materials...");
    const materialsRes = await pool.query("SELECT * FROM materials");
    console.log(`Found ${materialsRes.rows.length} materials to migrate`);

    if (materialsRes.rows.length > 0) {
      const materialsBatch = db.batch();
      for (const material of materialsRes.rows) {
        const materialRef = db.collection("materials").doc(material.id.toString());
        const materialData: any = {
          id: material.id.toString(),
          name: material.name || "",
          type: material.type || "",
          rate: parseFloat(material.rate) || 0,
          dyeingCost: parseFloat(material.dyeing_cost) || 0,
          description: material.description || ""
        };

        if (material.created_at) {
          const createdDate = new Date(material.created_at);
          if (!isNaN(createdDate.getTime())) {
            materialData.createdAt = admin.firestore.Timestamp.fromDate(createdDate);
          }
        }

        materialsBatch.set(materialRef, materialData);
      }
      await materialsBatch.commit();
      console.log("✅ Materials migrated!");
    }

    // Migrate Buyers
    console.log("📋 Migrating buyers...");
    const buyersRes = await pool.query("SELECT * FROM buyers");
    console.log(`Found ${buyersRes.rows.length} buyers to migrate`);

    if (buyersRes.rows.length > 0) {
      const buyersBatch = db.batch();
      for (const buyer of buyersRes.rows) {
        const buyerRef = db.collection("buyers").doc(buyer.id.toString());
        const buyerData: any = {
          id: buyer.id.toString(),
          buyerName: buyer.buyer_name || "",
          buyerCode: buyer.buyer_code || "",
          merchantName: buyer.merchant_name || "",
          merchantEmail: buyer.merchant_email || "",
          contractFiles: buyer.contract_files || "",
          isActive: buyer.is_active ?? true,
          accessLevel: buyer.access_level || "viewer",
          assignedBuyers: buyer.assigned_buyers || []
        };

        if (buyer.created_at) {
          const createdDate = new Date(buyer.created_at);
          if (!isNaN(createdDate.getTime())) {
            buyerData.createdAt = admin.firestore.Timestamp.fromDate(createdDate);
          }
        }

        buyersBatch.set(buyerRef, buyerData);
      }
      await buyersBatch.commit();
      console.log("✅ Buyers migrated!");
    }

    // Migrate Rugs
    console.log("📋 Migrating rugs...");
    const rugsRes = await pool.query("SELECT * FROM rugs");
    console.log(`Found ${rugsRes.rows.length} rugs to migrate`);

    if (rugsRes.rows.length > 0) {
      let rugBatch = db.batch();
      let batchCount = 0;
      let migratedCount = 0;

      for (const rug of rugsRes.rows) {
        const rugRef = db.collection("rugs").doc(rug.id.toString());
        
        // Filter out large data to prevent payload size issues
        const rugData: any = {
          id: rug.id.toString(),
          userId: rug.user_id || "",
          designName: rug.design_name || "",
          construction: rug.construction || "",
          quality: rug.quality || "",
          color: rug.color || "",
          primaryColor: rug.primary_color || "",
          secondaryColor: rug.secondary_color || "",
          orderType: rug.order_type || "",
          buyerName: rug.buyer_name || "",
          opsNo: rug.ops_no || "",
          carpetNo: rug.carpet_no || "",
          finishedGSM: parseFloat(rug.finished_gsm) || 0,
          unfinishedGSM: parseFloat(rug.unfinished_gsm) || 0,
          pileGSM: parseFloat(rug.pile_gsm) || 0,
          size: rug.size || "",
          typeOfDyeing: rug.type_of_dyeing || "",
          contractorType: rug.contractor_type || "",
          contractorName: rug.contractor_name || "",
          weaverName: rug.weaver_name || "",
          submittedBy: rug.submitted_by || "",
          washingContractor: rug.washing_contractor || "",
          hasWashing: rug.has_washing || "",
          warpIn6Inches: parseFloat(rug.warp_in_6_inches) || 0,
          weftIn6Inches: parseFloat(rug.weft_in_6_inches) || 0,
          pileHeightMM: parseFloat(rug.pile_height_mm) || 0,
          totalThicknessMM: parseFloat(rug.total_thickness_mm) || 0,
          edgeLongerSide: rug.edge_longer_side || "",
          edgeShortSide: rug.edge_short_side || "",
          fringesHemLength: rug.fringes_hem_length || "",
          fringesHemMaterial: rug.fringes_hem_material || "",
          shadeCardNo: rug.shade_card_no || "",
          weavingCost: parseFloat(rug.weaving_cost) || 0,
          finishingCost: parseFloat(rug.finishing_cost) || 0,
          packingCost: parseFloat(rug.packing_cost) || 0,
          overheadPercentage: parseFloat(rug.overhead_percentage) || 0,
          profitPercentage: parseFloat(rug.profit_percentage) || 0,
          totalMaterialCost: parseFloat(rug.total_material_cost) || 0,
          totalDirectCost: parseFloat(rug.total_direct_cost) || 0,
          finalCostPSM: parseFloat(rug.final_cost_psm) || 0,
          area: parseFloat(rug.area) || 0
        };

        // Handle arrays safely with size limits
        if (rug.materials && Array.isArray(rug.materials)) {
          rugData.materials = rug.materials.slice(0, 20); // Limit to 20 materials
        } else {
          rugData.materials = [];
        }

        if (rug.process_flow && Array.isArray(rug.process_flow)) {
          rugData.processFlow = rug.process_flow.slice(0, 20); // Limit to 20 process steps
        } else {
          rugData.processFlow = [];
        }

        // Handle images with size filtering
        if (rug.images && typeof rug.images === 'object') {
          rugData.images = {};
          // Only store image URLs/paths, not base64 encoded data
          Object.keys(rug.images).forEach(key => {
            const imageValue = rug.images[key];
            if (typeof imageValue === 'string' && imageValue.length < 1000) {
              rugData.images[key] = imageValue;
            }
          });
        } else {
          rugData.images = {};
        }

        if (rug.created_at) {
          const createdDate = new Date(rug.created_at);
          if (!isNaN(createdDate.getTime())) {
            rugData.createdAt = admin.firestore.Timestamp.fromDate(createdDate);
          }
        }

        if (rug.updated_at) {
          const updatedDate = new Date(rug.updated_at);
          if (!isNaN(updatedDate.getTime())) {
            rugData.updatedAt = admin.firestore.Timestamp.fromDate(updatedDate);
          }
        }

        rugBatch.set(rugRef, rugData);
        batchCount++;

        // Commit batch every 10 documents to avoid payload size limits
        if (batchCount === 10) {
          await rugBatch.commit();
          rugBatch = db.batch();
          migratedCount += batchCount;
          batchCount = 0;
          console.log(`  Committed batch of 10 rugs... (${migratedCount}/${rugsRes.rows.length} total)`);
        }
      }

      // Commit remaining documents
      if (batchCount > 0) {
        await rugBatch.commit();
        migratedCount += batchCount;
        console.log(`  Committed final batch of ${batchCount} rugs`);
      }

      console.log(`✅ Rugs migrated! (${migratedCount} total)`);
    }

    // Migrate PDOCs
    console.log("📋 Migrating PDOCs...");
    const pdocsRes = await pool.query("SELECT * FROM pdocs");
    console.log(`Found ${pdocsRes.rows.length} PDOCs to migrate`);

    if (pdocsRes.rows.length > 0) {
      const pdocsBatch = db.batch();
      for (const pdoc of pdocsRes.rows) {
        const pdocRef = db.collection("pdocs").doc(pdoc.id.toString());
        const pdocData: any = {
          id: pdoc.id.toString(),
          rugId: pdoc.rug_id?.toString() || "",
          buyerId: pdoc.buyer_id?.toString() || "",
          pdocNumber: pdoc.pdoc_number || "",
          buyerProductDesignCode: pdoc.buyer_product_design_code || "",
          pdocStatus: pdoc.pdoc_status || "draft",
          productTestRequirements: pdoc.product_test_requirements || "",
          callouts: pdoc.callouts || "",
          ted: pdoc.ted || "",
          sizeTolerance: pdoc.size_tolerance || "",
          weightTolerance: pdoc.weight_tolerance || "",
          ctq: pdoc.ctq || "",
          articleNumber: pdoc.article_number || "",
          skuNumber: pdoc.sku_number || ""
        };

        if (pdoc.original_product_timestamp) {
          const origDate = new Date(pdoc.original_product_timestamp);
          if (!isNaN(origDate.getTime())) {
            pdocData.originalProductTimestamp = admin.firestore.Timestamp.fromDate(origDate);
          }
        }

        if (pdoc.pdoc_creation_date) {
          const creationDate = new Date(pdoc.pdoc_creation_date);
          if (!isNaN(creationDate.getTime())) {
            pdocData.pdocCreationDate = admin.firestore.Timestamp.fromDate(creationDate);
          }
        }

        pdocsBatch.set(pdocRef, pdocData);
      }
      await pdocsBatch.commit();
      console.log("✅ PDOCs migrated!");
    }

    console.log("\n🎉 Migration completed successfully!");

    // Close PostgreSQL connection
    await pool.end();
    console.log("📚 Database connections closed");

  } catch (error) {
    console.error("❌ Migration error:", error);
    throw error;
  }
}

migrateData().catch((error) => {
  console.error("❌ Migration failed:", error);
});