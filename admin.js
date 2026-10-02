// ======================================
// بيانات دخول صاحب الموقع - تجريبية
// ======================================

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "123456";


// ======================================
// تسجيل دخول المدير
// ======================================

function adminLogin() {

    const username =
        document.getElementById("adminUsername").value.trim();

    const password =
        document.getElementById("adminPassword").value;

    const message =
        document.getElementById("adminLoginMessage");


    if (
        username === ADMIN_USERNAME &&
        password === ADMIN_PASSWORD
    ) {

        localStorage.setItem(
            "zainAdminLoggedIn",
            "true"
        );

        showAdminPanel();

    } else {

        message.textContent =
            "اسم المستخدم أو كلمة المرور غير صحيحة.";

        message.style.color = "red";
    }
}


// ======================================
// إظهار لوحة التحكم
// ======================================

function showAdminPanel() {

    document
        .getElementById("adminLogin")
        .classList.add("admin-hidden");

    document
        .getElementById("adminPanel")
        .classList.remove("admin-hidden");

    loadDashboard();
}


// ======================================
// تسجيل خروج المدير
// ======================================

function adminLogout() {

    localStorage.removeItem(
        "zainAdminLoggedIn"
    );

    location.reload();
}


// ======================================
// إضافة منتج
// ======================================

function addProduct() {

    const name =
        document.getElementById("productName").value.trim();

    const description =
        document
            .getElementById("productDescription")
            .value.trim();

    const price =
        document
            .getElementById("productPrice")
            .value.trim();

    const image =
        document
            .getElementById("productImage")
            .value.trim();

    const message =
        document.getElementById("productMessage");


    if (!name || !price) {

        message.textContent =
            "من فضلك أدخل اسم المنتج والسعر.";

        message.style.color = "red";

        return;
    }


    const products =
        JSON.parse(
            localStorage.getItem("zainProducts") || "[]"
        );


    const product = {

        id: Date.now(),

        name: name,

        description: description,

        price: price,

        image: image
    };


    products.push(product);


    localStorage.setItem(
        "zainProducts",
        JSON.stringify(products)
    );


    message.textContent =
        "تمت إضافة المنتج بنجاح.";

    message.style.color = "green";


    document.getElementById("productName").value = "";
    document.getElementById("productDescription").value = "";
    document.getElementById("productPrice").value = "";
    document.getElementById("productImage").value = "";


    loadProducts();
    updateStats();
}


// ======================================
// عرض المنتجات
// ======================================

function loadProducts() {

    const container =
        document.getElementById("productsList");

    const products =
        JSON.parse(
            localStorage.getItem("zainProducts") || "[]"
        );


    container.innerHTML = "";


    if (products.length === 0) {

        container.innerHTML =
            "<p>لا توجد منتجات حتى الآن.</p>";

        return;
    }


    products.forEach(function(product) {

        const div =
            document.createElement("div");

        div.className =
            "admin-product";


        const image =
            product.image
                ? `<img src="${product.image}" alt="">`
                : `<div>بدون صورة</div>`;


        div.innerHTML = `

            ${image}

            <div class="admin-product-info">

                <h3>${product.name}</h3>

                <p>${product.description || ""}</p>

                <strong>
                    ${product.price} جنيه
                </strong>

            </div>

            <button
                class="delete-button"
                onclick="deleteProduct(${product.id})">

                حذف

            </button>

        `;


        container.appendChild(div);

    });
}


// ======================================
// حذف منتج
// ======================================

function deleteProduct(id) {

    const products =
        JSON.parse(
            localStorage.getItem("zainProducts") || "[]"
        );


    const newProducts =
        products.filter(function(product) {

            return product.id !== id;

        });


    localStorage.setItem(
        "zainProducts",
        JSON.stringify(newProducts)
    );


    loadProducts();

    updateStats();
}


// ======================================
// عرض العملاء
// ======================================

function loadCustomers() {

    const container =
        document.getElementById("customersList");


    container.innerHTML = "";


    let count = 0;


    for (
        let i = 0;
        i < localStorage.length;
        i++
    ) {

        const key =
            localStorage.key(i);


        if (
            key &&
            key.startsWith("zainCustomer_")
        ) {

            const data =
                localStorage.getItem(key);


            try {

                const customer =
                    JSON.parse(data);


                const div =
                    document.createElement("div");

                div.className =
                    "admin-card";


                div.innerHTML = `

                    <strong>
                        ${customer.name}
                    </strong>

                    <p>
                        البريد:
                        ${customer.email}
                    </p>

                    <p>
                        الهاتف:
                        ${customer.phone}
                    </p>

                    <p>
                        العنوان:
                        ${customer.address}
                    </p>

                `;


                container.appendChild(div);

                count++;

            } catch (error) {

                console.log(error);

            }
        }
    }


    if (count === 0) {

        container.innerHTML =
            "<p>لا يوجد عملاء مسجلون على هذا الجهاز.</p>";
    }
}


// ======================================
// الطلبات
// ======================================

function loadOrders() {

    const container =
        document.getElementById("ordersList");


    const orders =
        JSON.parse(
            localStorage.getItem("zainOrders") || "[]"
        );


    container.innerHTML = "";


    if (orders.length === 0) {

        container.innerHTML =
            "<p>لا توجد طلبات حتى الآن.</p>";

        return;
    }


    orders.forEach(function(order) {

        const div =
            document.createElement("div");

        div.className =
            "admin-card";


        div.innerHTML = `

            <strong>
                ${order.product}
            </strong>

            <p>
                العميل:
                ${order.name}
            </p>

            <p>
                الهاتف:
                ${order.phone}
            </p>

            <p>
                العنوان:
                ${order.address}
            </p>

        `;


        container.appendChild(div);

    });
}


// ======================================
// الإحصائيات
// ======================================

function updateStats() {

    const products =
        JSON.parse(
            localStorage.getItem("zainProducts") || "[]"
        );


    let customers = 0;


    for (
        let i = 0;
        i < localStorage.length;
        i++
    ) {

        const key =
            localStorage.key(i);


        if (
            key &&
            key.startsWith("zainCustomer_")
        ) {

            customers++;
        }
    }


    const orders =
        JSON.parse(
            localStorage.getItem("zainOrders") || "[]"
        );


    document.getElementById(
        "productsCount"
    ).textContent = products.length;


    document.getElementById(
        "customersCount"
    ).textContent = customers;


    document.getElementById(
        "ordersCount"
    ).textContent = orders.length;
}


// ======================================
// تحميل لوحة التحكم
// ======================================

function loadDashboard() {

    loadProducts();

    loadCustomers();

    loadOrders();

    updateStats();
}


// ======================================
// عند فتح صفحة لوحة التحكم
// ======================================

window.addEventListener(
    "DOMContentLoaded",
    function() {

        const loggedIn =
            localStorage.getItem(
                "zainAdminLoggedIn"
            );


        if (loggedIn === "true") {

            showAdminPanel();
        }

    }
);