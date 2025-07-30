import { adminDb } from './server/firebaseAdmin';

async function checkBuyersAndArticles() {
  try {
    console.log('🔍 Checking buyers and their article relationships...');
    
    // Get all buyers
    const buyersSnapshot = await adminDb.collection('buyers').get();
    console.log(`📊 Found ${buyersSnapshot.size} buyers`);
    
    // Show first 5 buyers
    let buyerCount = 0;
    const buyerCodes = [];
    buyersSnapshot.forEach(doc => {
      if (buyerCount < 5) {
        const buyer = doc.data();
        console.log(`  - Buyer ${doc.id}: ${buyer.name} (${buyer.code})`);
        buyerCodes.push(buyer.code);
        buyerCount++;
      }
    });
    
    console.log('\n🔍 Checking buyerArticlesNo collection...');
    const articlesSnapshot = await adminDb.collection('buyerArticlesNo').get();
    console.log(`📊 Found ${articlesSnapshot.size} articles`);
    
    // Show article distribution by buyer code
    const articlesByBuyer = {};
    articlesSnapshot.forEach(doc => {
      const data = doc.data();
      const buyerCode = data.buyerDesignCode;
      if (!articlesByBuyer[buyerCode]) {
        articlesByBuyer[buyerCode] = [];
      }
      articlesByBuyer[buyerCode].push({
        id: doc.id,
        articleNumber: data.buyerArticleNumber,
        designName: data.designName,
        color: data.color,
        size: data.size
      });
    });
    
    console.log('\n📈 Articles by buyer code:');
    Object.entries(articlesByBuyer).forEach(([buyerCode, articles]) => {
      console.log(`  - ${buyerCode}: ${articles.length} articles`);
      articles.forEach((article, index) => {
        if (index < 2) { // Show first 2 articles per buyer
          console.log(`    • ${article.articleNumber}: ${article.designName} (${article.color}, ${article.size})`);
        }
      });
    });
    
    // Check if buyer codes match
    console.log('\n🔗 Checking buyer code matches...');
    const allBuyerCodes = [];
    buyersSnapshot.forEach(doc => {
      allBuyerCodes.push(doc.data().code);
    });
    
    const articleBuyerCodes = Object.keys(articlesByBuyer);
    console.log('Buyer codes in buyers collection:', allBuyerCodes.slice(0, 10));
    console.log('Buyer codes in articles collection:', articleBuyerCodes);
    
    const matches = articleBuyerCodes.filter(code => allBuyerCodes.includes(code));
    console.log('Matching buyer codes:', matches);
    
  } catch (error) {
    console.error('❌ Error checking data:', error);
  }
}

checkBuyersAndArticles();