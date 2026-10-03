```javascript
// =====================================================
// ZAIN WEBSITE - SUPABASE
// =====================================================

// بيانات Supabase
const SUPABASE_URL = "https://wkqlaljteigdelatimom.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_Eqycgyt3ZE9RDDwWyQi34A_LNZI6iSk";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// =====================================================
// بيانات الشركة
// =====================================================

const WHATSAPP_NUMBER = "201550154020";
const PHONE_NUMBER = "01550154020";


// =====================================================
// السلة
// =====================================================

let cart = JSON.parse(
    localStorage.getItem("zain_cart") || "[]"
);

let currentUser = null;
let isAdmin = false;
let currentProducts = [];


// =====================================================
// عند تحميل الموقع
// =====================================================

document.addEventListener("DOMContentLoaded", async () => {

    updateCartUI();

    await checkCurrentUser();

    await loadProducts();

});


// =====================================================
// المستخدم الحالي
// =====================================================

async function checkCurrentUser() {

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    if (session) {

        currentUser = session.user;

        await loadUserAccount();

    }

    supabaseClient.auth.onAuthStateChange(
        async (_event, session) => {

            currentUser =
                session ? session.user : null;

            if (currentUser) {

                await loadUserAccount();

            } else {

                isAdmin = false;

                updateAccountButton();

            }

        }
    );
}


// =====================================================
// بيانات الحساب
// =====================================================

async function loadUserAccount() {

    if (!currentUser) return;

    const { data, error } =
        await supabaseClient
            .from("customers")
            .select("*")
            .eq("user_id", currentUser.id)
            .maybeSingle();

    if (error) {

        console.error(error);

        isAdmin = false;

    } else {

        isAdmin =
            data?.is_admin === true;

    }

    updateAccountButton();
}


// =====================================================
// زر الحساب
// =====================================================

function updateAccountButton() {

    const button =
        document.getElementById("accountButton");

    if (!button) return;

    if (currentUser) {

        button.textContent =
            isAdmin ? "⚙️ المدير" : "👤 حسابي";

    } else {

        button.textContent =
            "👤 حسابي";

    }
}


// =====================================================
// فتح الحساب
// =====================================================

async function openAccount() {

    if (!currentUser) {

        showLogin();

        document
            .getElementById("authOverlay")
            .classList.add("show");

        return;
    }

    await loadUserAccount();

    const {
        data,
        error
    } = await supabaseClient
        .from("customers")
        .select("*")
        .eq("user_id", currentUser.id)
        .maybeSingle();

    const accountInfo =
        document.getElementById("accountInfo");

    if (error || !data) {

        accountInfo.innerHTML = `
            <p>
                البريد الإلكتروني:
                ${escapeHtml(currentUser.email || "")}
            </p>
        `;

    } else {

        accountInfo.innerHTML = `
            <p>
                <strong>الاسم:</strong>
                ${escapeHtml(data.name || "")}
            </p>

            <p>
                <strong>البريد:</strong>
                ${escapeHtml(currentUser.email || "")}
            </p>

            <p>
                <strong>الهاتف:</strong>
                ${escapeHtml(data.phone || "")}
            </p>

            <p>
                <strong>العنوان:</strong>
                ${escapeHtml(data.address || "")}
            </p>
        `;
    }

    const adminButton =
        document.getElementById("adminButton");

    if (isAdmin) {

        adminButton.classList.remove("auth-hidden");

    } else {

        adminButton.classList.add("auth-hidden");

    }

    document
        .getElementById("accountOverlay")
        .classList.add("show");
}


function closeAccount() {

    document
        .getElementById("accountOverlay")
        .classList.remove("show");
}


// =====================================================
// تسجيل حساب جديد
// =====================================================

async function registerCustomer() {

    const name =
        document
            .getElementById("registerName")
            .value
            .trim();

    const email =
        document
            .getElementById("registerEmail")
            .value
            .trim();

    const phone =
        document
            .getElementById("registerPhone")
            .value
            .trim();

    const address =
        document
            .getElementById("registerAddress")
            .value
            .trim();

    const password =
        document
            .getElementById("registerPassword")
            .value;

    const passwordConfirm =
        document
            .getElementById("registerPasswordConfirm")
            .value;

    const message =
        document.getElementById("registerMessage");


    if (!name || !email || !phone || !address || !password) {

        showAuthMessage(
            message,
            "من فضلك املأ جميع البيانات."
        );

        return;
    }


    if (password.length < 6) {

        showAuthMessage(
            message,
            "كلمة المرور يجب أن تكون 6 أحرف على الأقل."
        );

        return;
    }


    if (password !== passwordConfirm) {

        showAuthMessage(
            message,
            "كلمتا المرور غير متطابقتين."
        );

        return;
    }


    message.textContent =
        "جاري إنشاء الحساب...";


    const {
        data,
        error
    } = await supabaseClient.auth.signUp({

        email,
        password

    });


    if (error) {

        showAuthMessage(
            message,
            error.message
        );

        return;
    }


    if (!data.user) {

        showAuthMessage(
            message,
            "حدث خطأ أثناء إنشاء الحساب."
        );

        return;
    }


    const {
        error: customerError
    } = await supabaseClient
        .from("customers")
        .insert({

            user_id: data.user.id,
            name,
            phone,
            address,
            is_admin: false

        });


    if (customerError) {

        console.error(customerError);

        showAuthMessage(
            message,
            "تم إنشاء الحساب لكن حدثت مشكلة في حفظ بيانات العميل."
        );

        return;
    }


    showAuthMessage(
        message,
        "تم إنشاء الحساب بنجاح."
    );


    setTimeout(() => {

        showLogin();

    }, 1000);
}


// =====================================================
// تسجيل الدخول
// =====================================================

async function loginCustomer() {

    const email =
        document
            .getElementById("loginEmail")
            .value
            .trim();

    const password =
        document
            .getElementById("loginPassword")
            .value;

    const message =
        document.getElementById("loginMessage");


    if (!email || !password) {

        showAuthMessage(
            message,
            "اكتب البريد الإلكتروني وكلمة المرور."
        );

        return;
    }


    showAuthMessage(
        message,
        "جاري تسجيل الدخول..."
    );


    const {
        data,
        error
    } = await supabaseClient.auth.signInWithPassword({

        email,
        password

    });


    if (error) {

        showAuthMessage(
            message,
            "بيانات تسجيل الدخول غير صحيحة."
        );

        return;
    }


    currentUser = data.user;

    await loadUserAccount();

    closeAuth();

    showMessage(
        isAdmin
            ? "تم تسجيل دخول المدير بنجاح."
            : "تم تسجيل الدخول بنجاح."
    );
}


// =====================================================
// تسجيل الخروج
// =====================================================

async function logoutCustomer() {

    await supabaseClient.auth.signOut();

    currentUser = null;
    isAdmin = false;

    closeAccount();

    closeAdminPanel();

    updateAccountButton();

    showMessage(
        "تم تسجيل الخروج."
    );
}


// =====================================================
// استرجاع كلمة المرور
// =====================================================

async function resetPassword() {

    const email =
        document
            .getElementById("forgotEmail")
            .value
            .trim();

    const message =
        document.getElementById("forgotMessage");


    if (!email) {

        showAuthMessage(
            message,
            "اكتب البريد الإلكتروني."
        );

        return;
    }


    const redirectUrl =
        window.location.origin +
        window.location.pathname;


    const {
        error
    } = await supabaseClient.auth.resetPasswordForEmail(
        email,
        {
            redirectTo: redirectUrl
        }
    );


    if (error) {

        showAuthMessage(
            message,
            error.message
        );

        return;
    }


    showAuthMessage(
        message,
        "تم إرسال رابط استرجاع كلمة المرور إلى بريدك الإلكتروني."
    );
}


// =====================================================
// واجهة الحساب
// =====================================================

function showLogin() {

    document
        .getElementById("loginBox")
        .classList.remove("auth-hidden");

    document
        .getElementById("registerBox")
        .classList.add("auth-hidden");

    document
        .getElementById("forgotBox")
        .classList.add("auth-hidden");

    document
        .getElementById("authOverlay")
        .classList.add("show");
}


function showRegister() {

    document
        .getElementById("loginBox")
        .classList.add("auth-hidden");

    document
        .getElementById("registerBox")
        .classList.remove("auth-hidden");

    document
        .getElementById("forgotBox")
        .classList.add("auth-hidden");

    document
        .getElementById("authOverlay")
        .classList.add("show");
}


function showForgotPassword() {

    document
        .getElementById("loginBox")
        .classList.add("auth-hidden");

    document
        .getElementById("registerBox")
        .classList.add("auth-hidden");

    document
        .getElementById("forgotBox")
        .classList.remove("auth-hidden");

    document
        .getElementById("authOverlay")
        .classList.add("show");
}


function closeAuth() {

    document
        .getElementById("authOverlay")
        .classList.remove("show");
}


// =====================================================
// المنتجات
// =====================================================

async function loadProducts() {

    const container =
        document.getElementById("productsContainer");

    if (!container) return;


    container.innerHTML =
        `<div class="loading-products">
            جاري تحميل المنتجات...
        </div>`;


    const {
        data,
        error
    } = await supabaseClient
        .from("products")
        .select("*")
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(error);

        container.innerHTML =
            `<p>
                حدث خطأ أثناء تحميل المنتجات.
            </p>`;

        return;
    }


    currentProducts = data || [];

    renderProducts(currentProducts);

    renderAdminProducts(currentProducts);

    updateAdminProductsCount();
}


// =====================================================
// عرض المنتجات
// =====================================================

function renderProducts(products) {

    const container =
        document.getElementById("productsContainer");

    if (!container) return;


    if (!products.length) {

        container.innerHTML =
            `<div class="empty-products">
                لا توجد منتجات حاليًا.
            </div>`;

        return;
    }


    container.innerHTML =
        products.map(product => `

            <div class="product">

                <div class="product-image">

                    ${
                        product.image_url

                        ? `<img
                            src="${escapeAttribute(product.image_url)}"
                            alt="${escapeAttribute(product.name)}"
                            loading="lazy">`

                        : `<div class="no-image">
                            لا توجد صورة
                          </div>`
                    }

                </div>

                <h3>
                    ${escapeHtml(product.name)}
                </h3>

                <p>
                    ${escapeHtml(product.description || "")}
                </p>

                <strong>
                    ${formatPrice(product.price)} جنيه
                </strong>

                <button
                    onclick="addToCart('${product.id}')">

                    أضف للسلة

                </button>

            </div>

        `).join("");
}


// =====================================================
// فلترة المنتجات
// =====================================================

function filterProducts(category, button) {

    document
        .querySelectorAll(".category-button")
        .forEach(btn => {

            btn.classList.remove("active");

        });


    if (button) {

        button.classList.add("active");

    }


    if (category === "all") {

        renderProducts(currentProducts);

        return;
    }


    const filtered =
        currentProducts.filter(
            product =>
                product.category === category
        );


    renderProducts(filtered);
}


// =====================================================
// السلة
// =====================================================

function addToCart(productId) {

    const product =
        currentProducts.find(
            item => item.id === productId
        );


    if (!product) {

        showMessage(
            "المنتج غير موجود."
        );

        return;
    }


    const existing =
        cart.find(
            item => item.id === productId
        );


    if (existing) {

        existing.quantity += 1;

    } else {

        cart.push({

            id: product.id,
            name: product.name,
            price: Number(product.price),
            image_url: product.image_url,
            quantity: 1

        });

    }


    saveCart();

    updateCartUI();

    showMessage(
        "تمت إضافة المنتج إلى السلة."
    );
}


function removeFromCart(productId) {

    cart =
        cart.filter(
            item => item.id !== productId
        );

    saveCart();

    updateCartUI();

    renderCart();
}


function changeCartQuantity(productId, change) {

    const item =
        cart.find(
            product => product.id === productId
        );


    if (!item) return;


    item.quantity += change;


    if (item.quantity <= 0) {

        removeFromCart(productId);

        return;
    }


    saveCart();

    updateCartUI();

    renderCart();
}


function saveCart() {

    localStorage.setItem(
        "zain_cart",
        JSON.stringify(cart)
    );
}


function getCartTotal() {

    return cart.reduce(
        (total, item) =>
            total +
            (Number(item.price) *
             Number(item.quantity)),
        0
    );
}


function getCartCount() {

    return cart.reduce(
        (total, item) =>
            total + Number(item.quantity),
        0
    );
}


function updateCartUI() {

    const count =
        document.getElementById("cartCount");

    if (count) {

        count.textContent =
            getCartCount();

    }
}


function openCart() {

    renderCart();

    document
        .getElementById("cartOverlay")
        .classList.add("show");
}


function closeCart() {

    document
        .getElementById("cartOverlay")
        .classList.remove("show");
}


function renderCart() {

    const container =
        document.getElementById("cartItems");

    const total =
        document.getElementById("cartTotal");

    if (!container || !total) return;


    if (!cart.length) {

        container.innerHTML =
            `<p class="empty-cart">
                السلة فارغة.
            </p>`;

        total.textContent =
            "0 جنيه";

        return;
    }


    container.innerHTML =
        cart.map(item => `

            <div class="cart-item">

                <div class="cart-item-image">

                    ${
                        item.image_url
                        ? `<img
                            src="${escapeAttribute(item.image_url)}"
                            alt="${escapeAttribute(item.name)}">`
                        : ""
                    }

                </div>

                <div class="cart-item-info">

                    <strong>
                        ${escapeHtml(item.name)}
                    </strong>

                    <span>
                        ${formatPrice(item.price)} جنيه
                    </span>

                    <div class="quantity-controls">

                        <button
                            onclick="changeCartQuantity('${item.id}', -1)">
                            −
                        </button>

                        <span>
                            ${item.quantity}
                        </span>

                        <button
                            onclick="changeCartQuantity('${item.id}', 1)">
                            +
                        </button>

                    </div>

                </div>

                <button
                    class="remove-cart-item"
                    onclick="removeFromCart('${item.id}')">

                    حذف

                </button>

            </div>

        `).join("");


    total.textContent =
        `${formatPrice(getCartTotal())} جنيه`;
}


// =====================================================
// إتمام الطلب
// =====================================================

async function openCheckout() {

    if (!cart.length) {

        showMessage(
            "السلة فارغة."
        );

        return;
    }


    if (!currentUser) {

        closeCart();

        showLogin();

        showMessage(
            "سجل الدخول أولًا لإتمام الطلب."
        );

        return;
    }


    const {
        data
    } = await supabaseClient
        .from("customers")
        .select("*")
        .eq("user_id", currentUser.id)
        .maybeSingle();


    if (data) {

        document.getElementById("checkoutName").value =
            data.name || "";

        document.getElementById("checkoutPhone").value =
            data.phone || "";

        document.getElementById("checkoutAddress").value =
            data.address || "";
    }


    document.getElementById("checkoutTotal").textContent =
        `${formatPrice(getCartTotal())} جنيه`;


    closeCart();

    document
        .getElementById("checkoutOverlay")
        .classList.add("show");
}


function closeCheckout() {

    document
        .getElementById("checkoutOverlay")
        .classList.remove("show");
}


async function submitOrder() {

    if (!currentUser) {

        showMessage(
            "يجب تسجيل الدخول أولًا."
        );

        return;
    }


    if (!cart.length) {

        showMessage(
            "السلة فارغة."
        );

        return;
    }


    const name =
        document
            .getElementById("checkoutName")
            .value
            .trim();

    const phone =
        document
            .getElementById("checkoutPhone")
            .value
            .trim();

    const address =
        document
            .getElementById("checkoutAddress")
            .value
            .trim();

    const notes =
        document
            .getElementById("checkoutNotes")
            .value
            .trim();

    const message =
        document.getElementById("checkoutMessage");


    if (!name || !phone || !address) {

        message.textContent =
            "من فضلك املأ الاسم والهاتف والعنوان.";

        return;
    }


    message.textContent =
        "جاري إرسال الطلب...";


    const orderItems =
        cart.map(item => ({

            product_id: item.id,
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity)

        }));


    const {
        error
    } = await supabaseClient
        .from("orders")
        .insert({

            user_id: currentUser.id,

            customer_name: name,

            phone,

            address,

            items: {

                products: orderItems,

                notes: notes

            },

            total: getCartTotal(),

            status: "جديد"

        });


    if (error) {

        console.error(error);

        message.textContent =
            "حدث خطأ أثناء إرسال الطلب.";

        return;
    }


    message.textContent =
        "تم إرسال طلبك بنجاح ✅";


    cart = [];

    saveCart();

    updateCartUI();


    setTimeout(() => {

        closeCheckout();

        showMessage(
            "تم تسجيل الطلب بنجاح."
        );

    }, 1200);
}


// =====================================================
// لوحة المدير
// =====================================================

async function openAdminPanel() {

    if (!currentUser || !isAdmin) {

        showMessage(
            "ليس لديك صلاحية الدخول."
        );

        return;
    }


    closeAccount();


    document
        .getElementById("adminOverlay")
        .classList.add("show");


    await loadAdminData();
}


function closeAdminPanel() {

    document
        .getElementById("adminOverlay")
        .classList.remove("show");
}


async function loadAdminData() {

    await loadProducts();

    await loadAdminOrders();

    await loadAdminCustomers();

    updateAdminProductsCount();
}


// =====================================================
// إضافة منتج
// =====================================================

async function addProduct() {

    if (!isAdmin) {

        showMessage(
            "ليس لديك صلاحية."
        );

        return;
    }


    const name =
        document
            .getElementById("productName")
            .value
            .trim();

    const description =
        document
            .getElementById("productDescription")
            .value
            .trim();

    const price =
        Number(
            document
                .getElementById("productPrice")
                .value
        );

    const category =
        document
            .getElementById("productCategory")
            .value;

    const file =
        document
            .getElementById("productImage")
            .files[0];

    const message =
        document.getElementById("productMessage");


    if (!name || !price || !file) {

        message.textContent =
            "اكتب اسم المنتج والسعر واختر صورة.";

        return;
    }


    message.textContent =
        "جاري رفع المنتج...";


    let imageUrl = null;


    // رفع الصورة
    if (file) {

        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        const fileName =
            `${crypto.randomUUID()}.${extension}`;


        const {
            error: uploadError
        } = await supabaseClient.storage
            .from("product-images")
            .upload(
                fileName,
                file,
                {
                    contentType: file.type,
                    upsert: false
                }
            );


        if (uploadError) {

            console.error(uploadError);

            message.textContent =
                "حدث خطأ أثناء رفع الصورة.";

            return;
        }


        const {
            data
        } = supabaseClient.storage
            .from("product-images")
            .getPublicUrl(fileName);


        imageUrl =
            data.publicUrl;
    }


    // إضافة المنتج
    const {
        error
    } = await supabaseClient
        .from("products")
        .insert({

            name,

            description,

            price,

            category,

            image_url: imageUrl

        });


    if (error) {

        console.error(error);

        message.textContent =
            "حدث خطأ أثناء إضافة المنتج.";

        return;
    }


    document.getElementById("productName").value = "";

    document.getElementById("productDescription").value = "";

    document.getElementById("productPrice").value = "";

    document.getElementById("productImage").value = "";


    message.textContent =
        "تمت إضافة المنتج بنجاح ✅";


    await loadProducts();
}


// =====================================================
// عرض منتجات المدير
// =====================================================

function renderAdminProducts(products) {

    const container =
        document.getElementById("adminProductsList");

    if (!container) return;


    if (!products.length) {

        container.innerHTML =
            `<p>
                لا توجد منتجات.
            </p>`;

        return;
    }


    container.innerHTML =
        products.map(product => `

            <div class="admin-product-item">

                <div>

                    ${
                        product.image_url
                        ? `<img
                            src="${escapeAttribute(product.image_url)}"
                            alt="">`
                        : ""
                    }

                </div>

                <div class="admin-product-info">

                    <strong>
                        ${escapeHtml(product.name)}
                    </strong>

                    <span>
                        ${formatPrice(product.price)} جنيه
                    </span>

                    <small>
                        ${escapeHtml(product.category)}
                    </small>

                </div>

                <button
                    onclick="deleteProduct('${product.id}')">

                    حذف

                </button>

            </div>

        `).join("");
}


// =====================================================
// حذف منتج
// =====================================================

async function deleteProduct(productId) {

    if (!isAdmin) return;


    const confirmed =
        confirm(
            "هل تريد حذف هذا المنتج؟"
        );


    if (!confirmed) return;


    const {
        error
    } = await supabaseClient
        .from("products")
        .delete()
        .eq("id", productId);


    if (error) {

        console.error(error);

        showMessage(
            "حدث خطأ أثناء حذف المنتج."
        );

        return;
    }


    cart =
        cart.filter(
            item => item.id !== productId
        );

    saveCart();

    updateCartUI();


    await loadProducts();

    showMessage(
        "تم حذف المنتج."
    );
}


// =====================================================
// طلبات المدير
// =====================================================

async function loadAdminOrders() {

    const container =
        document.getElementById("adminOrdersList");

    if (!container || !isAdmin) return;


    const {
        data,
        error
    } = await supabaseClient
        .from("orders")
        .select("*")
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(error);

        container.innerHTML =
            `<p>
                تعذر تحميل الطلبات.
            </p>`;

        return;
    }


    document.getElementById("adminOrdersCount")
        .textContent =
        data.length;


    if (!data.length) {

        container.innerHTML =
            `<p>
                لا توجد طلبات حاليًا.
            </p>`;

        return;
    }


    container.innerHTML =
        data.map(order => `

            <div class="admin-order-item">

                <h4>
                    طلب رقم:
                    ${escapeHtml(order.id.substring(0, 8))}
                </h4>

                <p>
                    👤
                    ${escapeHtml(order.customer_name)}
                </p>

                <p>
                    📞
                    ${escapeHtml(order.phone)}
                </p>

                <p>
                    📍
                    ${escapeHtml(order.address)}
                </p>

                <p>
                    💰
                    ${formatPrice(order.total)} جنيه
                </p>

                <p>
                    الحالة:
                    <strong>
                        ${escapeHtml(order.status)}
                    </strong>
                </p>

                <select
                    onchange="updateOrderStatus('${order.id}', this.value)">

                    <option
                        value="جديد"
                        ${order.status === "جديد" ? "selected" : ""}>
                        جديد
                    </option>

                    <option
                        value="قيد التجهيز"
                        ${order.status === "قيد التجهيز" ? "selected" : ""}>
                        قيد التجهيز
                    </option>

                    <option
                        value="تم الشحن"
                        ${order.status === "تم الشحن" ? "selected" : ""}>
                        تم الشحن
                    </option>

                    <option
                        value="تم التسليم"
                        ${order.status === "تم التسليم" ? "selected" : ""}>
                        تم التسليم
                    </option>

                    <option
                        value="ملغي"
                        ${order.status === "ملغي" ? "selected" : ""}>
                        ملغي
                    </option>

                </select>

            </div>

        `).join("");
}


// =====================================================
// تغيير حالة الطلب
// =====================================================

async function updateOrderStatus(orderId, status) {

    if (!isAdmin) return;


    const {
        error
    } = await supabaseClient
        .from("orders")
        .update({
            status
        })
        .eq("id", orderId);


    if (error) {

        console.error(error);

        showMessage(
            "تعذر تحديث حالة الطلب."
        );

        return;
    }


    showMessage(
        "تم تحديث حالة الطلب."
    );

    await loadAdminOrders();
}


// =====================================================
// العملاء
// =====================================================

async function loadAdminCustomers() {

    const container =
        document.getElementById("adminCustomersList");

    if (!container || !isAdmin) return;


    const {
        data,
        error
    } = await supabaseClient
        .from("customers")
        .select("*")
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(error);

        container.innerHTML =
            `<p>
                تعذر تحميل العملاء.
            </p>`;

        return;
    }


    document.getElementById("adminCustomersCount")
        .textContent =
        data.length;


    if (!data.length) {

        container.innerHTML =
            `<p>
                لا يوجد عملاء.
            </p>`;

        return;
    }


    container.innerHTML =
        data.map(customer => `

            <div class="admin-customer-item">

                <strong>
                    ${escapeHtml(customer.name)}
                </strong>

                <p>
                    📞
                    ${escapeHtml(customer.phone || "")}
                </p>

                <p>
                    📍
                    ${escapeHtml(customer.address || "")}
                </p>

            </div>

        `).join("");
}


// =====================================================
// الإحصائيات
// =====================================================

function updateAdminProductsCount() {

    const element =
        document.getElementById("adminProductsCount");

    if (element) {

        element.textContent =
            currentProducts.length;

    }
}


// =====================================================
// التواصل
// =====================================================

function openWhatsApp() {

    window.open(
        `https://wa.me/${WHATSAPP_NUMBER}`,
        "_blank"
    );
}


function callCompany() {

    window.location.href =
        `tel:${PHONE_NUMBER}`;
}


function openLocation() {

    const query =
        encodeURIComponent(
            "ههيا الشرقية خلف السكة الحديد شارع أبو منصور للمخبوزات"
        );


    window.open(
        `https://www.google.com/maps/search/?api=1&query=${query}`,
        "_blank"
    );
}


// =====================================================
// رسائل
// =====================================================

function showMessage(text) {

    const box =
        document.getElementById("messageBox");

    const message =
        document.getElementById("messageText");


    if (!box || !message) return;


    message.textContent =
        text;


    box.classList.add("show");


    setTimeout(() => {

        box.classList.remove("show");

    }, 3000);
}


function showAuthMessage(element, text) {

    if (!element) return;

    element.textContent =
        text;
}


// =====================================================
// أدوات حماية النصوص
// =====================================================

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {

    return escapeHtml(value);
}


function formatPrice(value) {

    return Number(value || 0)
        .toLocaleString("ar-EG");
}


// =====================================================
// إغلاق النوافذ عند الضغط خارجها
// =====================================================

document.addEventListener(
    "click",
    event => {

        const overlays =
            document.querySelectorAll(
                ".modal-overlay"
            );


        overlays.forEach(overlay => {

            if (event.target === overlay) {

                overlay.classList.remove("show");

            }

        });

    }
);
```
