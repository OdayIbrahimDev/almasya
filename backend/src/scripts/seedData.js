import mongoose from "mongoose";
import Categories from "../models/Categories.js";
import Currency from "../models/Currency.js";
import Products from "../models/Products.js";
import connectDB from "../config/db.js";

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Categories.deleteMany({});
    await Currency.deleteMany({});
    await Products.deleteMany({});
    
    console.log("🗑️ Cleared existing data");
    
    // Create Categories
    const categories = await Categories.create([
      {
        name: "خواتم",
        description: "خواتم إماراتية يدوية مصنوعة خصيصاً لك",
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400",
        isActive: true
      },
      {
        name: "سلاسل",
        description: "سلاسل ذهبية وفضية بتصاميم إماراتية أصيلة",
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400",
        isActive: true
      },
      {
        name: "إكسسوارات",
        description: "إكسسوارات يدوية متنوعة بتصاميم إماراتية فاخرة",
        image: "https://images.unsplash.com/photo-1506630448388-4e683c17fa5e?w=400",
        isActive: true
      }
    ]);
    
    console.log("📂 Created categories:", categories.length);
    
    // Create Currencies
    const currencies = await Currency.create([
      {
        name: "درهم إماراتي",
        symbol: "د.إ",
        code: "AED",
        exchangeRate: 1,
        isActive: true
      },
      {
        name: "دولار أمريكي",
        symbol: "$",
        code: "USD",
        exchangeRate: 3.67,
        isActive: true
      },
      {
        name: "يورو",
        symbol: "€",
        code: "EUR",
        exchangeRate: 4.05,
        isActive: true
      }
    ]);
    
    console.log("💰 Created currencies:", currencies.length);
    
    // Create Products (only 3 as requested)
    const products = await Products.create([
      {
        name: "خاتم ذهبي إماراتي فاخر",
        description: "خاتم ذهبي بتصميم إماراتي أصيل، مصنوع يدوياً من الذهب عيار 18 قيراط. مزين بالأحجار الكريمة التقليدية الإماراتية.",
        price: 2500,
        offerPrice: 2200,
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400",
        category: categories[0]._id, // خواتم
        inStock: true,
        isBestSeller: true
      },
      {
        name: "سلسلة فضية إماراتية أنيقة",
        description: "سلسلة فضية بتصميم إماراتي تقليدي، مصنوعة يدوياً من الفضة الإيطالية عيار 925. تتميز بالأناقة والجمال الأصيل.",
        price: 1200,
        offerPrice: 1000,
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400",
        category: categories[1]._id, // سلاسل
        inStock: true,
        isBestSeller: true
      },
      {
        name: "إكسسوارات يدوية إماراتية",
        description: "مجموعة إكسسوارات يدوية بتصاميم إماراتية فاخرة، تشمل أساور وأقراط مصنوعة خصيصاً لك. تجمع بين الأصالة والحداثة.",
        price: 800,
        offerPrice: 650,
        image: "https://images.unsplash.com/photo-1506630448388-4e683c17fa5e?w=400",
        category: categories[2]._id, // إكسسوارات
        inStock: true,
        isBestSeller: true
      }
    ]);
    
    console.log("🛍️ Created products:", products.length);
    
    console.log("✅ Database seeded successfully!");
    console.log("📊 Summary:");
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Currencies: ${currencies.length}`);
    console.log(`   - Products: ${products.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
