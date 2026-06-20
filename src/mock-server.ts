// Client-side Stateful Mock API Server for Salam-Tech MVP
// Overrides window.fetch to handle /api/ endpoints locally using localStorage.

// Database Interfaces
interface DB {
  users: any[];
  companies: any[];
  products: any[];
  categories: any[];
  suppliers: any[];
  sales: any[];
  customers: any[];
  employees: any[];
  transactions: any[];
  bookings: any[];
  services: any[];
  documents: any[];
  conversations: any[];
  messages: Record<number, any[]>;
  purchases: any[];
}

const DB_KEY = "salam_tech_mock_db";

// Helper to load DB
function loadDB(): DB {
  try {
    const data = localStorage.getItem(DB_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error("Error loading mock DB", e);
  }
  return initDB();
}

// Helper to save DB
function saveDB(db: DB) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.error("Error saving mock DB", e);
  }
}

// Initialize DB with rich demo data
function initDB(): DB {
  const db: DB = {
    users: [
      {
        id: 1,
        name: "Demo User",
        email: "admin@salam.uz",
        password: "admin123",
        role: "admin",
        businessName: "Salam Tech Demo LLC",
        companyId: "C-12345",
        subscriptionPlan: "business",
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        name: "Super Admin",
        email: "superadmin@salam.uz",
        password: "admin123",
        role: "super_admin",
        businessName: "Salam Tech Platform",
        companyId: "SYSTEM",
        subscriptionPlan: "enterprise",
        createdAt: new Date().toISOString()
      }
    ],
    companies: [
      {
        id: "C-12345",
        name: "Salam Tech Demo LLC",
        isBlocked: false,
        subscriptionPlan: "business",
        createdAt: "2026-01-10T12:00:00Z"
      },
      {
        id: "C-99999",
        name: "Korzinka Supermarket",
        isBlocked: false,
        subscriptionPlan: "enterprise",
        createdAt: "2026-02-15T09:30:00Z"
      },
      {
        id: "C-11111",
        name: "Artel Manufacturing",
        isBlocked: true,
        subscriptionPlan: "start",
        createdAt: "2026-03-01T15:45:00Z"
      }
    ],
    categories: [
      { id: 1, name: "Ichimliklar", description: "Salqin va issiq ichimliklar", createdAt: new Date().toISOString() },
      { id: 2, name: "Shirinliklar", description: "Pishiriqlar va shokoladlar", createdAt: new Date().toISOString() },
      { id: 3, name: "Fast Food", description: "Tez tayyor bo'ladigan taomlar", createdAt: new Date().toISOString() },
      { id: 4, name: "Kanselyariya", description: "Ofis jihozlari va qog'ozlar", createdAt: new Date().toISOString() }
    ],
    suppliers: [
      { id: 1, name: "Coca-Cola Bottlers Uzbekistan", phone: "+998 71 200 60 60", email: "info@coca-cola.uz", address: "Toshkent sh., Bektemir tumani", createdAt: new Date().toISOString() },
      { id: 2, name: "Anglesey Food (Korzinka)", phone: "+998 78 140 14 14", email: "contact@korzinka.uz", address: "Toshkent sh., Yakkasaroy tumani", createdAt: new Date().toISOString() },
      { id: 3, name: "Sherin Shakar MChJ", phone: "+998 90 123 45 67", email: "sherin@shirin.uz", address: "Samarqand sh., Registon ko'chasi", createdAt: new Date().toISOString() }
    ],
    products: [
      {
        id: 1,
        name: "Coca-Cola 0.5L",
        barcode: "4780005001234",
        categoryId: 1,
        categoryName: "Ichimliklar",
        supplierId: 1,
        supplierName: "Coca-Cola Bottlers Uzbekistan",
        purchasePrice: 4000,
        sellingPrice: 6500,
        stockQuantity: 120,
        lowStockThreshold: 20,
        unit: "dona",
        description: "Gazlangan salqin ichimlik",
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        name: "Pepsi 1.0L",
        barcode: "4780005005678",
        categoryId: 1,
        categoryName: "Ichimliklar",
        supplierId: 1,
        supplierName: "Coca-Cola Bottlers Uzbekistan",
        purchasePrice: 6000,
        sellingPrice: 9500,
        stockQuantity: 15, // Low stock!
        lowStockThreshold: 25,
        unit: "dona",
        description: "Gazlangan salqin ichimlik",
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        name: "Shokoladli Croissant",
        barcode: "4780002233445",
        categoryId: 2,
        categoryName: "Shirinliklar",
        supplierId: 3,
        supplierName: "Sherin Shakar MChJ",
        purchasePrice: 8000,
        sellingPrice: 12000,
        stockQuantity: 45,
        lowStockThreshold: 10,
        unit: "dona",
        description: "Yumshoq fransuzcha pishiriq",
        createdAt: new Date().toISOString()
      },
      {
        id: 4,
        name: "Hot-Dog Classic",
        barcode: "MOCK-HD-001",
        categoryId: 3,
        categoryName: "Fast Food",
        supplierId: 2,
        supplierName: "Anglesey Food (Korzinka)",
        purchasePrice: 9000,
        sellingPrice: 15000,
        stockQuantity: 8, // Low stock!
        lowStockThreshold: 15,
        unit: "dona",
        description: "Klassik sosiskali hot-dog",
        createdAt: new Date().toISOString()
      },
      {
        id: 5,
        name: "A4 Qog'oz (Double A)",
        barcode: "8850123456789",
        categoryId: 4,
        categoryName: "Kanselyariya",
        supplierId: 2,
        supplierName: "Anglesey Food (Korzinka)",
        purchasePrice: 32000,
        sellingPrice: 48000,
        stockQuantity: 60,
        lowStockThreshold: 10,
        unit: "quti",
        description: "Yuqori sifatli ofis qog'ozi",
        createdAt: new Date().toISOString()
      }
    ],
    sales: [],
    customers: [
      { id: 1, name: "Aziz Rahimov", phone: "+998 90 900 11 22", email: "aziz@gmail.com", address: "Chilonzor 3-mavze", segment: "vip", notes: "Doimiy mijoz, naqd pulda to'laydi", totalPurchases: 150000, purchaseCount: 3, createdAt: new Date().toISOString() },
      { id: 2, name: "Zilola Umarova", phone: "+998 93 500 44 55", email: "zilola@mail.ru", address: "Yunusoobod 11-dahsa", segment: "regular", notes: "Kartada to'lov qiladi", totalPurchases: 48000, purchaseCount: 1, createdAt: new Date().toISOString() },
      { id: 3, name: "Bahodir Jalolov", phone: "+998 97 700 88 99", email: "bahodir@sport.uz", address: "Sergeli 5-daha", segment: "new", notes: "Yangi mijoz", totalPurchases: 0, purchaseCount: 0, createdAt: new Date().toISOString() }
    ],
    employees: [
      { id: 1, name: "Jamshid Karimov", email: "jamshid@salam.uz", phone: "+998 90 111 22 33", role: "manager", position: "Menejer", salary: 5000000, isActive: true, hiredAt: "2026-01-15", createdAt: new Date().toISOString() },
      { id: 2, name: "Nafisa Alimova", email: "nafisa@salam.uz", phone: "+998 93 222 33 44", role: "cashier", position: "Kassir", salary: 3500000, isActive: true, hiredAt: "2026-02-10", createdAt: new Date().toISOString() }
    ],
    transactions: [
      { id: 1, type: "income", amount: 150000, category: "Sotuv", description: "Kassa savdosi - Aziz Rahimov", date: new Date().toISOString().split("T")[0], createdAt: new Date().toISOString() },
      { id: 2, type: "income", amount: 48000, category: "Sotuv", description: "Kassa savdosi - Zilola Umarova", date: new Date().toISOString().split("T")[0], createdAt: new Date().toISOString() },
      { id: 3, type: "expense", amount: 250000, category: "Ijara", description: "Ofis ijarasi uchun to'lov", date: new Date().toISOString().split("T")[0], createdAt: new Date().toISOString() },
      { id: 4, type: "expense", amount: 65000, category: "Kommunal", description: "Internet va telefon xarajatlari", date: new Date().toISOString().split("T")[0], createdAt: new Date().toISOString() }
    ],
    bookings: [
      { id: 1, customerName: "Asror Baxtiyorov", customerPhone: "+998 90 333 44 55", serviceName: "Klassik Soch Turmagi", employeeName: "Jamshid Karimov", bookingDate: new Date().toISOString().split("T")[0], bookingTime: "14:00", duration: "30", amount: "50000", notes: "Soch va soqol", status: "pending" },
      { id: 2, customerName: "Madina Malikova", customerPhone: "+998 94 444 55 66", serviceName: "Spa Muolajasi", employeeName: "Nafisa Alimova", bookingDate: new Date().toISOString().split("T")[0], bookingTime: "16:30", duration: "60", amount: "120000", notes: "Spa massaj", status: "confirmed" }
    ],
    services: [
      { id: 1, name: "Klassik Soch Turmagi", price: 50000, duration: 30, description: "Sochni yuvish va turmaklash", category: "Erkaklar", isActive: true, createdAt: new Date().toISOString() },
      { id: 2, name: "Soqol tekislash", price: 30000, duration: 20, description: "Trimmer yordamida shakl berish", category: "Erkaklar", isActive: true, createdAt: new Date().toISOString() },
      { id: 3, name: "Spa Muolajasi", price: 120000, duration: 60, description: "Yuz va tana uchun dam olish massaji", category: "Spa", isActive: true, createdAt: new Date().toISOString() }
    ],
    documents: [
      { id: 1, name: "Shartnoma №42.pdf", type: "contract", fileUrl: "#", size: 1024 * 342, createdAt: new Date().toISOString() },
      { id: 2, name: "Invoice_anglesey_0620.pdf", type: "invoice", fileUrl: "#", size: 1024 * 124, createdAt: new Date().toISOString() }
    ],
    conversations: [
      { id: 1, title: "Biznes tahlili va sotuvlar", createdAt: new Date().toISOString() }
    ],
    messages: {
      1: [
        { id: 1, conversationId: 1, role: "model", content: "Salom! Men sizning AI Direktoringizman. Bugun do'koningizdagi sotuvlarni yaxshilash yoki inventar hisobotini ko'rib chiqish bo'yicha qanday yordam bera olaman?", createdAt: new Date().toISOString() }
      ]
    },
    purchases: [
      { id: 1, supplierId: 1, supplierName: "Coca-Cola Bottlers Uzbekistan", purchaseItems: [{ productName: "Coca-Cola 0.5L", quantity: 100, price: 4000 }], totalAmount: 400000, status: "completed", createdAt: new Date().toISOString() }
    ]
  };
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  return db;
}

// Intercept window.fetch
const originalFetch = window.fetch;
window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const urlString = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

  // Check if it is a mock API call
  if (!urlString.includes("/api/")) {
    return originalFetch.apply(this, arguments as any);
  }

  // Extract pathname and query parameters
  const dummyOrigin = window.location.origin;
  const parsedUrl = new URL(urlString, dummyOrigin);
  const pathname = parsedUrl.pathname;

  // Extract apiPath (starting with /api/)
  const match = pathname.match(/\/api\/(.+)$/);
  const apiPath = match ? "/api/" + match[1] : "";
  const method = (init?.method || "GET").toUpperCase();
  const searchParams = parsedUrl.searchParams;

  // Load database
  const db = loadDB();

  // Emulate backend processing latency
  await new Promise((resolve) => setTimeout(resolve, 250));

  // Helper to extract JSON body
  const getBody = () => {
    try {
      return init?.body ? JSON.parse(init.body as string) : {};
    } catch {
      return {};
    }
  };

  // Helper to respond with JSON
  const jsonResponse = (data: any, status = 200) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        "Content-Type": "application/json"
      }
    });
  };

  // Check Auth Token (Dummy validation)
  const authHeader = init?.headers ? new Headers(init.headers).get("authorization") : null;
  const token = authHeader ? authHeader.replace("Bearer ", "") : localStorage.getItem("salam_tech_token");

  // ROUTER LOGIC
  try {
    // ----------------------------------------------------
    // AUTHENTICATION
    // ----------------------------------------------------
    if (method === "GET" && apiPath.startsWith("/api/auth/lookup-company/")) {
      const parts = apiPath.split("/");
      const companyId = parts[parts.length - 1];
      const company = db.companies.find((c) => c.id === companyId);
      if (company) {
        return jsonResponse({ companyId: company.id, businessName: company.name });
      } else {
        // Automatically register any company for demo purposes if it is typed!
        if (/^C-\d+$/.test(companyId)) {
          const newCompany = {
            id: companyId,
            name: `${companyId} Demo Business`,
            isBlocked: false,
            subscriptionPlan: "business",
            createdAt: new Date().toISOString()
          };
          db.companies.push(newCompany);
          saveDB(db);
          return jsonResponse({ companyId: newCompany.id, businessName: newCompany.name });
        }
        return jsonResponse({ error: "Kompaniya topilmadi" }, 404);
      }
    }

    if (method === "POST" && apiPath === "/api/auth/register") {
      const body = getBody();
      const companyId = `C-${Math.floor(10000 + Math.random() * 90000)}`;
      const newUser = {
        id: db.users.length + 1,
        name: body.name,
        email: body.email,
        password: body.password || "admin123",
        role: "admin",
        businessName: body.businessName,
        companyId,
        subscriptionPlan: "business",
        createdAt: new Date().toISOString()
      };

      const newCompany = {
        id: companyId,
        name: body.businessName,
        isBlocked: false,
        subscriptionPlan: "business",
        createdAt: new Date().toISOString()
      };

      db.users.push(newUser);
      db.companies.push(newCompany);
      saveDB(db);

      return jsonResponse({
        user: newUser,
        token: `mock-token-${newUser.id}-${Date.now()}`
      });
    }

    if (method === "POST" && apiPath === "/api/auth/login") {
      const body = getBody();
      const user = db.users.find((u) => u.email === body.email);
      if (user && (user.password === body.password || body.password === "admin123")) {
        return jsonResponse({
          user,
          token: `mock-token-${user.id}-${Date.now()}`
        });
      }
      return jsonResponse({ error: "Email yoki parol noto'g'ri" }, 400);
    }

    if (method === "POST" && apiPath === "/api/auth/logout") {
      return jsonResponse({ success: true });
    }

    if (method === "GET" && apiPath === "/api/auth/me") {
      if (!token) return jsonResponse({ error: "Unauthorized" }, 401);
      // Retrieve user from token
      const match = token.match(/mock-token-(\d+)/);
      const userId = match ? parseInt(match[1]) : 1;
      const user = db.users.find((u) => u.id === userId) || db.users[0];
      return jsonResponse(user);
    }

    // ----------------------------------------------------
    // DASHBOARD / METRICS
    // ----------------------------------------------------
    if (method === "GET" && apiPath === "/api/dashboard/summary") {
      const today = new Date().toISOString().split("T")[0];
      const todaySales = db.sales.filter((s) => s.createdAt.startsWith(today));
      const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);

      const monthlyRevenue = db.sales.reduce((sum, s) => sum + s.total, 0) + 19500000; // adding base demo revenue
      const lowStockCount = db.products.filter((p) => p.stockQuantity <= p.lowStockThreshold).length;
      const totalProducts = db.products.length;
      const activeEmployees = db.employees.filter((e) => e.isActive).length;
      const totalCustomers = db.customers.length;
      const totalSalesCount = db.sales.length + 34; // adding demo sales

      // Profit calculations (Demo profit margin ~35%)
      const estimatedProfit = Math.round(monthlyRevenue * 0.35);

      return jsonResponse({
        todayRevenue,
        monthlyRevenue,
        totalProducts,
        lowStockCount,
        activeEmployees,
        totalCustomers,
        estimatedProfit,
        totalSalesCount
      });
    }

    if (method === "GET" && apiPath === "/api/dashboard/revenue-chart") {
      // 6-month chart data
      const chartData = [
        { month: "Yan", revenue: 14000000, profit: 4900000, expenses: 9100000 },
        { month: "Fev", revenue: 16500000, profit: 5800000, expenses: 10700000 },
        { month: "Mar", revenue: 15200000, profit: 5300000, expenses: 9900000 },
        { month: "Apr", revenue: 18900000, profit: 6600000, expenses: 12300000 },
        { month: "May", revenue: 21000000, profit: 7400000, expenses: 13600000 },
        { month: "Jun", revenue: 24500000, profit: 8600000, expenses: 15900000 }
      ];
      return jsonResponse(chartData);
    }

    if (method === "GET" && apiPath === "/api/dashboard/low-stock") {
      const lowStockList = db.products.filter((p) => p.stockQuantity <= p.lowStockThreshold);
      return jsonResponse(lowStockList);
    }

    if (method === "GET" && apiPath === "/api/dashboard/top-products") {
      const topProducts = db.products.slice(0, 4).map((p, i) => ({
        id: p.id,
        name: p.name,
        soldCount: 45 - i * 10,
        revenue: (45 - i * 10) * p.sellingPrice
      }));
      return jsonResponse(topProducts);
    }

    if (method === "GET" && apiPath === "/api/dashboard/recent-sales") {
      const recent = db.sales.slice(-5).reverse();
      return jsonResponse(recent);
    }

    // ----------------------------------------------------
    // PRODUCTS CRUD
    // ----------------------------------------------------
    if (apiPath === "/api/products") {
      if (method === "GET") {
        const search = searchParams.get("search")?.toLowerCase() || "";
        const catId = searchParams.get("categoryId") ? parseInt(searchParams.get("categoryId") || "") : null;
        const lowStock = searchParams.get("lowStock") === "true";

        let filtered = [...db.products];

        if (search) {
          filtered = filtered.filter(
            (p) =>
              p.name.toLowerCase().includes(search) ||
              (p.barcode && p.barcode.includes(search))
          );
        }

        if (catId) {
          filtered = filtered.filter((p) => p.categoryId === catId);
        }

        if (lowStock) {
          filtered = filtered.filter((p) => p.stockQuantity <= p.lowStockThreshold);
        }

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const start = (page - 1) * limit;
        const pagedProducts = filtered.slice(start, start + limit);

        return jsonResponse({
          products: pagedProducts,
          total: filtered.length,
          page,
          limit
        });
      }

      if (method === "POST") {
        const body = getBody();
        const category = db.categories.find((c) => c.id === body.categoryId);
        const supplier = db.suppliers.find((s) => s.id === body.supplierId);

        const newProduct = {
          id: db.products.length ? Math.max(...db.products.map((p) => p.id)) + 1 : 1,
          name: body.name,
          barcode: body.barcode || String(Math.floor(1000000000000 + Math.random() * 9000000000000)),
          categoryId: body.categoryId,
          categoryName: category ? category.name : "",
          supplierId: body.supplierId,
          supplierName: supplier ? supplier.name : "",
          purchasePrice: Number(body.purchasePrice),
          sellingPrice: Number(body.sellingPrice),
          stockQuantity: Number(body.stockQuantity),
          lowStockThreshold: Number(body.lowStockThreshold ?? 10),
          unit: body.unit || "dona",
          description: body.description || "",
          createdAt: new Date().toISOString()
        };

        db.products.push(newProduct);
        saveDB(db);
        return jsonResponse(newProduct, 21);
      }
    }

    if (apiPath.startsWith("/api/products/barcode/")) {
      const parts = apiPath.split("/");
      const barcode = parts[parts.length - 1];
      const product = db.products.find((p) => p.barcode === barcode);
      if (product) {
        return jsonResponse(product);
      }
      return jsonResponse({ error: "Mahsulot topilmadi" }, 404);
    }

    if (apiPath.startsWith("/api/products/")) {
      const parts = apiPath.split("/");
      const id = parseInt(parts[parts.length - 1]);

      if (method === "GET") {
        const product = db.products.find((p) => p.id === id);
        if (product) return jsonResponse(product);
        return jsonResponse({ error: "Product not found" }, 404);
      }

      if (method === "PUT") {
        const body = getBody();
        const index = db.products.findIndex((p) => p.id === id);
        if (index !== -1) {
          const category = db.categories.find((c) => c.id === body.categoryId);
          const supplier = db.suppliers.find((s) => s.id === body.supplierId);

          db.products[index] = {
            ...db.products[index],
            name: body.name,
            barcode: body.barcode || db.products[index].barcode,
            categoryId: body.categoryId,
            categoryName: category ? category.name : db.products[index].categoryName,
            supplierId: body.supplierId,
            supplierName: supplier ? supplier.name : db.products[index].supplierName,
            purchasePrice: Number(body.purchasePrice),
            sellingPrice: Number(body.sellingPrice),
            stockQuantity: Number(body.stockQuantity),
            lowStockThreshold: Number(body.lowStockThreshold ?? 10),
            unit: body.unit,
            description: body.description
          };
          saveDB(db);
          return jsonResponse(db.products[index]);
        }
        return jsonResponse({ error: "Product not found" }, 404);
      }

      if (method === "DELETE") {
        const index = db.products.findIndex((p) => p.id === id);
        if (index !== -1) {
          db.products.splice(index, 1);
          saveDB(db);
          return jsonResponse({ success: true });
        }
        return jsonResponse({ error: "Product not found" }, 404);
      }
    }

    // ----------------------------------------------------
    // CATEGORIES CRUD
    // ----------------------------------------------------
    if (apiPath === "/api/categories") {
      if (method === "GET") {
        // calculate productCount dynamically
        const list = db.categories.map((c) => ({
          ...c,
          productCount: db.products.filter((p) => p.categoryId === c.id).length
        }));
        return jsonResponse(list);
      }

      if (method === "POST") {
        const body = getBody();
        const newCat = {
          id: db.categories.length ? Math.max(...db.categories.map((c) => c.id)) + 1 : 1,
          name: body.name,
          description: body.description || "",
          createdAt: new Date().toISOString()
        };
        db.categories.push(newCat);
        saveDB(db);
        return jsonResponse(newCat, 21);
      }
    }

    if (apiPath.startsWith("/api/categories/")) {
      const parts = apiPath.split("/");
      const id = parseInt(parts[parts.length - 1]);

      if (method === "PUT") {
        const body = getBody();
        const index = db.categories.findIndex((c) => c.id === id);
        if (index !== -1) {
          db.categories[index] = {
            ...db.categories[index],
            name: body.name,
            description: body.description
          };
          saveDB(db);
          return jsonResponse(db.categories[index]);
        }
        return jsonResponse({ error: "Category not found" }, 404);
      }

      if (method === "DELETE") {
        const index = db.categories.findIndex((c) => c.id === id);
        if (index !== -1) {
          db.categories.splice(index, 1);
          saveDB(db);
          return jsonResponse({ success: true });
        }
        return jsonResponse({ error: "Category not found" }, 404);
      }
    }

    // ----------------------------------------------------
    // SUPPLIERS CRUD
    // ----------------------------------------------------
    if (apiPath === "/api/suppliers") {
      if (method === "GET") {
        return jsonResponse(db.suppliers);
      }

      if (method === "POST") {
        const body = getBody();
        const newSup = {
          id: db.suppliers.length ? Math.max(...db.suppliers.map((s) => s.id)) + 1 : 1,
          name: body.name,
          phone: body.phone || "",
          email: body.email || "",
          address: body.address || "",
          createdAt: new Date().toISOString()
        };
        db.suppliers.push(newSup);
        saveDB(db);
        return jsonResponse(newSup, 21);
      }
    }

    if (apiPath.startsWith("/api/suppliers/")) {
      const parts = apiPath.split("/");
      const id = parseInt(parts[parts.length - 1]);

      if (method === "PUT") {
        const body = getBody();
        const index = db.suppliers.findIndex((s) => s.id === id);
        if (index !== -1) {
          db.suppliers[index] = {
            ...db.suppliers[index],
            name: body.name,
            phone: body.phone,
            email: body.email,
            address: body.address
          };
          saveDB(db);
          return jsonResponse(db.suppliers[index]);
        }
        return jsonResponse({ error: "Supplier not found" }, 404);
      }

      if (method === "DELETE") {
        const index = db.suppliers.findIndex((s) => s.id === id);
        if (index !== -1) {
          db.suppliers.splice(index, 1);
          saveDB(db);
          return jsonResponse({ success: true });
        }
        return jsonResponse({ error: "Supplier not found" }, 404);
      }
    }

    // ----------------------------------------------------
    // CUSTOMERS (CRM) CRUD
    // ----------------------------------------------------
    if (apiPath === "/api/customers") {
      if (method === "GET") {
        const search = searchParams.get("search")?.toLowerCase() || "";
        let list = [...db.customers];
        if (search) {
          list = list.filter((c) => c.name.toLowerCase().includes(search) || (c.phone && c.phone.includes(search)));
        }

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const start = (page - 1) * limit;
        const paged = list.slice(start, start + limit);

        return jsonResponse({
          customers: paged,
          total: list.length,
          page,
          limit
        });
      }

      if (method === "POST") {
        const body = getBody();
        const newCust = {
          id: db.customers.length ? Math.max(...db.customers.map((c) => c.id)) + 1 : 1,
          name: body.name,
          phone: body.phone || "",
          email: body.email || "",
          address: body.address || "",
          segment: body.segment || "new",
          notes: body.notes || "",
          totalPurchases: 0,
          purchaseCount: 0,
          createdAt: new Date().toISOString()
        };
        db.customers.push(newCust);
        saveDB(db);
        return jsonResponse(newCust, 21);
      }
    }

    if (apiPath === "/api/customers/top") {
      const top = [...db.customers].sort((a, b) => b.totalPurchases - a.totalPurchases);
      return jsonResponse(top);
    }

    if (apiPath.startsWith("/api/customers/")) {
      const parts = apiPath.split("/");
      const id = parseInt(parts[parts.length - 1]);

      if (method === "PUT") {
        const body = getBody();
        const index = db.customers.findIndex((c) => c.id === id);
        if (index !== -1) {
          db.customers[index] = {
            ...db.customers[index],
            name: body.name,
            phone: body.phone,
            email: body.email,
            address: body.address,
            segment: body.segment,
            notes: body.notes
          };
          saveDB(db);
          return jsonResponse(db.customers[index]);
        }
        return jsonResponse({ error: "Customer not found" }, 404);
      }

      if (method === "DELETE") {
        const index = db.customers.findIndex((c) => c.id === id);
        if (index !== -1) {
          db.customers.splice(index, 1);
          saveDB(db);
          return jsonResponse({ success: true });
        }
        return jsonResponse({ error: "Customer not found" }, 404);
      }
    }

    // ----------------------------------------------------
    // EMPLOYEES CRUD
    // ----------------------------------------------------
    if (apiPath === "/api/employees") {
      if (method === "GET") {
        return jsonResponse(db.employees);
      }

      if (method === "POST") {
        const body = getBody();
        const newEmp = {
          id: db.employees.length ? Math.max(...db.employees.map((e) => e.id)) + 1 : 1,
          name: body.name,
          email: body.email,
          phone: body.phone || "",
          role: body.role || "cashier",
          position: body.position || "Xodim",
          salary: Number(body.salary || 0),
          isActive: true,
          hiredAt: body.hiredAt || new Date().toISOString().split("T")[0],
          createdAt: new Date().toISOString()
        };
        db.employees.push(newEmp);
        saveDB(db);
        return jsonResponse(newEmp, 21);
      }
    }

    if (apiPath.startsWith("/api/employees/")) {
      const parts = apiPath.split("/");
      const id = parseInt(parts[parts.length - 1]);

      if (method === "PUT") {
        const body = getBody();
        const index = db.employees.findIndex((e) => e.id === id);
        if (index !== -1) {
          db.employees[index] = {
            ...db.employees[index],
            name: body.name,
            email: body.email,
            phone: body.phone,
            role: body.role,
            position: body.position,
            salary: Number(body.salary),
            isActive: body.isActive !== undefined ? body.isActive : db.employees[index].isActive,
            hiredAt: body.hiredAt
          };
          saveDB(db);
          return jsonResponse(db.employees[index]);
        }
        return jsonResponse({ error: "Employee not found" }, 404);
      }

      if (method === "DELETE") {
        const index = db.employees.findIndex((e) => e.id === id);
        if (index !== -1) {
          db.employees.splice(index, 1);
          saveDB(db);
          return jsonResponse({ success: true });
        }
        return jsonResponse({ error: "Employee not found" }, 404);
      }
    }

    // ----------------------------------------------------
    // SALES (POS) & INVENTORY UPDATES
    // ----------------------------------------------------
    if (apiPath === "/api/sales") {
      if (method === "GET") {
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const start = (page - 1) * limit;
        const pagedSales = db.sales.slice(start, start + limit);
        return jsonResponse({
          sales: pagedSales,
          total: db.sales.length,
          page,
          limit
        });
      }

      if (method === "POST") {
        const body = getBody();

        // Map sale items and calculate subtotal/total
        let subtotal = 0;
        const items = body.items.map((item: any, idx: number) => {
          const product = db.products.find((p) => p.id === item.productId);
          if (!product) throw new Error(`Product ${item.productId} not found`);

          // Decrement stock
          product.stockQuantity = Math.max(0, product.stockQuantity - item.quantity);

          const unitPrice = product.sellingPrice;
          const discount = item.discount || 0;
          const total = (unitPrice - discount) * item.quantity;
          subtotal += total;

          return {
            id: idx + 1,
            productId: item.productId,
            productName: product.name,
            quantity: item.quantity,
            unitPrice,
            discount,
            total
          };
        });

        const discount = body.discount || 0;
        const total = Math.max(0, subtotal - discount);

        const customer = db.customers.find((c) => c.id === body.customerId);
        if (customer) {
          customer.totalPurchases += total;
          customer.purchaseCount += 1;
          if (customer.totalPurchases > 1000000) customer.segment = "vip";
          else if (customer.totalPurchases > 0) customer.segment = "regular";
        }

        const newSale = {
          id: db.sales.length ? Math.max(...db.sales.map((s) => s.id)) + 1 : 1,
          receiptNumber: `S-${Date.now().toString().slice(-6)}`,
          customerId: body.customerId,
          customerName: customer ? customer.name : "Anonym",
          employeeId: 1, // Logged in cashier ID
          employeeName: db.employees[1]?.name || "Kassir Nafisa",
          items,
          subtotal,
          discount,
          total,
          cashAmount: body.cashAmount,
          cardAmount: body.cardAmount,
          paymentMethod: body.paymentMethod || "cash",
          status: body.paymentMethod === "credit" ? "debt" : "completed",
          createdAt: new Date().toISOString()
        };

        db.sales.push(newSale);

        // Record income transaction
        db.transactions.push({
          id: db.transactions.length ? Math.max(...db.transactions.map((t) => t.id)) + 1 : 1,
          type: "income",
          amount: total,
          category: "Sotuv",
          description: `Kassa sotuvi (${newSale.receiptNumber}) ${customer ? "- " + customer.name : ""}`,
          date: new Date().toISOString().split("T")[0],
          createdAt: new Date().toISOString()
        });

        saveDB(db);
        return jsonResponse(newSale, 21);
      }
    }

    if (apiPath === "/api/sales/debts") {
      const debts = db.sales.filter((s) => s.status === "debt" || s.paymentMethod === "credit");
      return jsonResponse(debts);
    }

    // ----------------------------------------------------
    // FINANCE & TRANSACTIONS
    // ----------------------------------------------------
    if (apiPath === "/api/transactions") {
      if (method === "GET") {
        const type = searchParams.get("type");
        let list = [...db.transactions];
        if (type) {
          list = list.filter((t) => t.type === type);
        }

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const start = (page - 1) * limit;
        const paged = list.slice(start, start + limit);

        return jsonResponse({
          transactions: paged,
          total: list.length,
          page,
          limit
        });
      }

      if (method === "POST") {
        const body = getBody();
        const newTx = {
          id: db.transactions.length ? Math.max(...db.transactions.map((t) => t.id)) + 1 : 1,
          type: body.type || "income",
          amount: Number(body.amount),
          category: body.category || "Boshqa",
          description: body.description || "",
          date: body.date || new Date().toISOString().split("T")[0],
          createdAt: new Date().toISOString()
        };

        db.transactions.push(newTx);
        saveDB(db);
        return jsonResponse(newTx, 21);
      }
    }

    if (apiPath === "/api/finance/summary") {
      const income = db.transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
      const expenses = db.transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

      const summary = {
        totalIncome: income,
        totalExpenses: expenses,
        netProfit: income - expenses,
        monthlyData: [
          { month: "Yan", revenue: 14000000, profit: 4900000, expenses: 9100000 },
          { month: "Fev", revenue: 16500000, profit: 5800000, expenses: 10700000 },
          { month: "Mar", revenue: 15200000, profit: 5300000, expenses: 9900000 },
          { month: "Apr", revenue: 18900000, profit: 6600000, expenses: 12300000 },
          { month: "May", revenue: 21000000, profit: 7400000, expenses: 13600000 },
          { month: "Jun", revenue: income || 24500000, profit: (income - expenses) || 8600000, expenses: expenses || 15900000 }
        ]
      };
      return jsonResponse(summary);
    }

    // ----------------------------------------------------
    // DOCUMENTS CRUD
    // ----------------------------------------------------
    if (apiPath === "/api/documents") {
      if (method === "GET") {
        return jsonResponse(db.documents);
      }

      if (method === "POST") {
        const body = getBody();
        const newDoc = {
          id: db.documents.length ? Math.max(...db.documents.map((d) => d.id)) + 1 : 1,
          name: body.name,
          type: body.type || "other",
          fileUrl: body.fileUrl || "#",
          size: body.size || 1024 * 150, // 150KB default
          createdAt: new Date().toISOString()
        };
        db.documents.push(newDoc);
        saveDB(db);
        return jsonResponse(newDoc, 21);
      }
    }

    if (apiPath.startsWith("/api/documents/")) {
      const parts = apiPath.split("/");
      const id = parseInt(parts[parts.length - 1]);
      if (method === "DELETE") {
        const index = db.documents.findIndex((d) => d.id === id);
        if (index !== -1) {
          db.documents.splice(index, 1);
          saveDB(db);
          return jsonResponse({ success: true });
        }
        return jsonResponse({ error: "Document not found" }, 404);
      }
    }

    // ----------------------------------------------------
    // BOOKINGS & SERVICES CRUD
    // ----------------------------------------------------
    if (apiPath === "/api/bookings") {
      if (method === "GET") {
        const date = searchParams.get("date");
        let list = [...db.bookings];
        if (date) {
          list = list.filter((b) => b.bookingDate === date);
        }
        return jsonResponse(list);
      }

      if (method === "POST") {
        const body = getBody();
        const newBooking = {
          id: db.bookings.length ? Math.max(...db.bookings.map((b) => b.id)) + 1 : 1,
          customerName: body.customerName,
          customerPhone: body.customerPhone || "",
          serviceName: body.serviceName,
          employeeName: body.employeeName || "",
          bookingDate: body.bookingDate,
          bookingTime: body.bookingTime,
          duration: body.duration || "60",
          amount: body.amount || "0",
          notes: body.notes || "",
          status: "pending",
          createdAt: new Date().toISOString()
        };

        db.bookings.push(newBooking);
        saveDB(db);
        return jsonResponse(newBooking, 21);
      }
    }

    if (apiPath.startsWith("/api/bookings/")) {
      const parts = apiPath.split("/");
      const id = parseInt(parts[parts.length - 1]);

      if (method === "PUT") {
        const body = getBody();
        const index = db.bookings.findIndex((b) => b.id === id);
        if (index !== -1) {
          db.bookings[index] = {
            ...db.bookings[index],
            status: body.status || db.bookings[index].status
          };
          saveDB(db);
          return jsonResponse(db.bookings[index]);
        }
        return jsonResponse({ error: "Booking not found" }, 404);
      }

      if (method === "DELETE") {
        const index = db.bookings.findIndex((b) => b.id === id);
        if (index !== -1) {
          db.bookings.splice(index, 1);
          saveDB(db);
          return jsonResponse({ success: true });
        }
        return jsonResponse({ error: "Booking not found" }, 404);
      }
    }

    if (apiPath === "/api/services") {
      if (method === "GET") {
        return jsonResponse(db.services);
      }

      if (method === "POST") {
        const body = getBody();
        const newSvc = {
          id: db.services.length ? Math.max(...db.services.map((s) => s.id)) + 1 : 1,
          name: body.name,
          price: Number(body.price),
          duration: Number(body.duration),
          description: body.description || "",
          category: body.category || "",
          isActive: body.isActive !== undefined ? body.isActive : true,
          createdAt: new Date().toISOString()
        };
        db.services.push(newSvc);
        saveDB(db);
        return jsonResponse(newSvc, 21);
      }
    }

    if (apiPath.startsWith("/api/services/")) {
      const parts = apiPath.split("/");
      const id = parseInt(parts[parts.length - 1]);

      if (method === "PUT") {
        const body = getBody();
        const index = db.services.findIndex((s) => s.id === id);
        if (index !== -1) {
          db.services[index] = {
            ...db.services[index],
            name: body.name,
            price: Number(body.price),
            duration: Number(body.duration),
            description: body.description,
            category: body.category,
            isActive: body.isActive !== undefined ? body.isActive : db.services[index].isActive
          };
          saveDB(db);
          return jsonResponse(db.services[index]);
        }
        return jsonResponse({ error: "Service not found" }, 404);
      }

      if (method === "DELETE") {
        const index = db.services.findIndex((s) => s.id === id);
        if (index !== -1) {
          db.services.splice(index, 1);
          saveDB(db);
          return jsonResponse({ success: true });
        }
        return jsonResponse({ error: "Service not found" }, 404);
      }
    }

    // ----------------------------------------------------
    // PURCHASES CRUD
    // ----------------------------------------------------
    if (apiPath === "/api/purchases") {
      if (method === "GET") {
        return jsonResponse(db.purchases);
      }

      if (method === "POST") {
        const body = getBody();
        const supplier = db.suppliers.find((s) => s.id === body.supplierId);

        // Process purchase: increment products stock
        let totalAmount = 0;
        const purchaseItems = body.purchaseItems || [];
        purchaseItems.forEach((item: any) => {
          const product = db.products.find((p) => p.name === item.productName || p.id === item.productId);
          if (product) {
            product.stockQuantity += item.quantity;
            if (item.price) product.purchasePrice = item.price;
          }
          totalAmount += (item.price || 0) * item.quantity;
        });

        const newPurchase = {
          id: db.purchases.length ? Math.max(...db.purchases.map((p) => p.id)) + 1 : 1,
          supplierId: body.supplierId,
          supplierName: supplier ? supplier.name : "Noma'lum Ta'minotchi",
          purchaseItems,
          totalAmount: totalAmount || body.totalAmount || 0,
          status: "completed",
          createdAt: new Date().toISOString()
        };

        db.purchases.push(newPurchase);

        // Record expense transaction
        db.transactions.push({
          id: db.transactions.length ? Math.max(...db.transactions.map((t) => t.id)) + 1 : 1,
          type: "expense",
          amount: newPurchase.totalAmount,
          category: "Satib olish",
          description: `Ta'minotchidan mahsulot xaridi (${newPurchase.supplierName})`,
          date: new Date().toISOString().split("T")[0],
          createdAt: new Date().toISOString()
        });

        saveDB(db);
        return jsonResponse(newPurchase, 21);
      }
    }

    // ----------------------------------------------------
    // AI GEMINI CONVERSATION
    // ----------------------------------------------------
    if (apiPath === "/api/gemini/conversations") {
      if (method === "GET") {
        return jsonResponse(db.conversations);
      }

      if (method === "POST") {
        const body = getBody();
        const newConv = {
          id: db.conversations.length ? Math.max(...db.conversations.map((c) => c.id)) + 1 : 1,
          title: body.title || "Yangi suhbat",
          createdAt: new Date().toISOString()
        };

        db.conversations.push(newConv);
        db.messages[newConv.id] = [
          {
            id: 1,
            conversationId: newConv.id,
            role: "model",
            content: `Salom! Yangi suhbatga xush kelibsiz. Men sizning AI Direktoringizman. Bugun qanday biznes tahlilini amalga oshiramiz?`,
            createdAt: new Date().toISOString()
          }
        ];

        saveDB(db);
        return jsonResponse(newConv, 21);
      }
    }

    if (apiPath.startsWith("/api/gemini/conversations/")) {
      const parts = apiPath.split("/");
      const convId = parseInt(parts[4]); // /api/gemini/conversations/:id

      if (parts.length === 6 && parts[5] === "messages") {
        // /api/gemini/conversations/:id/messages
        if (method === "GET") {
          return jsonResponse(db.messages[convId] || []);
        }

        if (method === "POST") {
          const body = getBody();
          const userMsgId = (db.messages[convId]?.length || 0) + 1;
          const userMsg = {
            id: userMsgId,
            conversationId: convId,
            role: "user",
            content: body.content,
            createdAt: new Date().toISOString()
          };

          if (!db.messages[convId]) db.messages[convId] = [];
          db.messages[convId].push(userMsg);

          // Generate automated smart AI reply
          const botMsgId = userMsgId + 1;
          let aiText = `Tushundim. Siz "${body.content}" mavzusida so'rayapsiz. Biznes tizimingizdagi ma'lumotlarga ko'ra: `;

          const promptLower = body.content.toLowerCase();
          if (promptLower.includes("savdo") || promptLower.includes("kassa") || promptLower.includes("daromad")) {
            const totalRevenue = db.sales.reduce((sum, s) => sum + s.total, 0) + 19500000;
            aiText += `Joriy oydagi jami savdolaringiz ${totalRevenue.toLocaleString()} so'mni tashkil qilmoqda. Bugungi sotuvlar esa yaxshi o'sish dinamikasini ko'rsatyapti. Mijozlaringiz bilan SMS orqali aloqani kuchaytirishni maslahat beraman.`;
          } else if (promptLower.includes("mahsulot") || promptLower.includes("ombor") || promptLower.includes("kam qolgan")) {
            const lowStockCount = db.products.filter((p) => p.stockQuantity <= p.lowStockThreshold).length;
            aiText += `Hozirda omborda ${db.products.length} turdagi mahsulot bor. Shundan ${lowStockCount} ta mahsulot (masalan: Pepsi) minimal chegaraga yetib qolgan. Ularga tezkor buyurtma berishingiz lozim.`;
          } else if (promptLower.includes("xodim") || promptLower.includes("ishchi") || promptLower.includes("menejer")) {
            aiText += `Hozirda tizimda ${db.employees.length} nafar faol xodim ishlamoqda. Kassir Nafisa Alimova bugun eng faol savdo qilgan xodim bo'ldi.`;
          } else {
            aiText += `Salam-Tech tizimidagi ma'lumotlarni tahlil qildim. Biznesingizda barcha jarayonlar barqaror. Sotuvlarni oshirish uchun CRM bo'limidan mijozlarga chegirmalar berishni va yangi xizmatlarni katalogga qo'shishni tavsiya qilaman.`;
          }

          const botMsg = {
            id: botMsgId,
            conversationId: convId,
            role: "model",
            content: aiText,
            createdAt: new Date().toISOString()
          };

          db.messages[convId].push(botMsg);
          saveDB(db);
          return jsonResponse(botMsg, 21);
        }
      } else {
        // GET /api/gemini/conversations/:id or DELETE
        if (method === "GET") {
          const conv = db.conversations.find((c) => c.id === convId);
          if (conv) {
            return jsonResponse({
              ...conv,
              messages: db.messages[convId] || []
            });
          }
          return jsonResponse({ error: "Conversation not found" }, 404);
        }

        if (method === "DELETE") {
          const index = db.conversations.findIndex((c) => c.id === convId);
          if (index !== -1) {
            db.conversations.splice(index, 1);
            delete db.messages[convId];
            saveDB(db);
            return jsonResponse({ success: true });
          }
          return jsonResponse({ error: "Conversation not found" }, 404);
        }
      }
    }

    // ----------------------------------------------------
    // SUPER-ADMIN PLATFORM MANAGEMENT
    // ----------------------------------------------------
    if (apiPath === "/api/admin/analytics") {
      const totalCompanies = db.companies.length;
      const blockedCompanies = db.companies.filter((c) => c.isBlocked).length;
      const activeCompanies = totalCompanies - blockedCompanies;

      const totalUsers = db.users.length;
      const totalSales = db.sales.reduce((sum, s) => sum + s.total, 0) + 19500000;
      const salesCount = db.sales.length + 34;

      return jsonResponse({
        companies: { total: totalCompanies, blocked: blockedCompanies, active: activeCompanies },
        users: totalUsers,
        sales: { count: salesCount, volume: totalSales },
        plans: [
          { plan: "start", count: db.companies.filter((c) => c.subscriptionPlan === "start").length },
          { plan: "business", count: db.companies.filter((c) => c.subscriptionPlan === "business").length },
          { plan: "enterprise", count: db.companies.filter((c) => c.subscriptionPlan === "enterprise").length }
        ]
      });
    }

    if (apiPath === "/api/admin/companies") {
      const list = db.companies.map((c) => {
        // Calculate mock stats
        return {
          id: c.id,
          name: c.name,
          isBlocked: c.isBlocked,
          subscriptionPlan: c.subscriptionPlan,
          createdAt: c.createdAt,
          stats: {
            users: db.users.filter((u) => u.companyId === c.id).length || 1,
            products: c.id === "C-12345" ? db.products.length : 12,
            salesCount: c.id === "C-12345" ? db.sales.length : 4,
            salesTotal: c.id === "C-12345" ? db.sales.reduce((sum, s) => sum + s.total, 0) : 560000
          }
        };
      });
      return jsonResponse(list);
    }

    if (apiPath.startsWith("/api/admin/companies/")) {
      const parts = apiPath.split("/");
      const compId = parts[parts.length - 1]; // /api/admin/companies/:id

      const blockAction = parts[parts.length - 2]; // check if block/unblock

      if (parts[parts.length - 1] === "block" || parts[parts.length - 1] === "unblock") {
        const action = parts[parts.length - 1];
        const targetId = parts[parts.length - 2];
        const company = db.companies.find((c) => c.id === targetId);
        if (company) {
          company.isBlocked = action === "block";
          saveDB(db);
          return jsonResponse(company);
        }
        return jsonResponse({ error: "Company not found" }, 404);
      } else {
        // GET detail
        const company = db.companies.find((c) => c.id === compId);
        if (company) {
          const companyUsers = db.users.filter((u) => u.companyId === compId);
          if (companyUsers.length === 0) {
            companyUsers.push({
              id: 99,
              name: "Demo Admin",
              email: `admin@${compId.toLowerCase()}.uz`,
              role: "admin",
              createdAt: company.createdAt
            });
          }
          return jsonResponse({
            id: company.id,
            name: company.name,
            isBlocked: company.isBlocked,
            subscriptionPlan: company.subscriptionPlan,
            createdAt: company.createdAt,
            users: companyUsers,
            stats: {
              users: companyUsers.length,
              products: compId === "C-12345" ? db.products.length : 12,
              salesCount: compId === "C-12345" ? db.sales.length : 4,
              salesTotal: compId === "C-12345" ? db.sales.reduce((sum, s) => sum + s.total, 0) : 560000,
              customers: compId === "C-12345" ? db.customers.length : 8
            }
          });
        }
        return jsonResponse({ error: "Company not found" }, 404);
      }
    }

    // ----------------------------------------------------
    // GENERIC FALLBACK
    // ----------------------------------------------------
    if (method === "GET" && apiPath === "/api/healthz") {
      return jsonResponse({ status: "ok" });
    }

    // Default API Route Not Mocked
    console.warn(`Mock server intercepted unhandled route: ${method} ${apiPath}`);
    return originalFetch.apply(this, arguments as any);

  } catch (err: any) {
    console.error("Mock Server Router Error: ", err);
    return jsonResponse({ error: err.message || "Serverda xatolik yuz berdi" }, 500);
  }
};

console.log("🚀 Stateful Mock API Server has successfully intercepted fetch requests.");
