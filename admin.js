// ======================================
// Firebase Admin Dashboard
// زين للملابس الجاهزة
// ======================================

import { auth, db } from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// ======================================
// UID صاحب الموقع
// ======================================

const ADMIN_UID = "426qZ2WuS5dK3YTy37LWAKbLO112";


// ======================================
// عناصر صفحة تسجيل الدخول
// ======================================

const loginBox =
    document.getElementById("loginBox");

const adminPanel =
    document.getElementById("adminPanel");

const emailInput =
    document.getElementById("adminEmail");

const passwordInput =
    document.getElementById("adminPassword");

const loginMessage =
    document.getElementById("adminLoginMessage");


// ======================================
// تسجيل دخول الأدمن
// ======================================

window.adminLogin = async function () {

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    if (!email || !password) {

        loginMessage.textContent =
            "من فضلك اكتب البريد الإلكتروني وكلمة المرور.";

        loginMessage.style.color = "red";

        return;
    }


    loginMessage.textContent =
        "جاري تسجيل الدخول...";

    loginMessage.style.color = "black";


    try {

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user =
            userCredential.user;


        // التأكد أن الحساب هو حساب صاحب الموقع
        if (user.uid !== ADMIN_UID) {

            await signOut(auth);

            loginMessage.textContent =
                "هذا الحساب ليس حساب صاحب الموقع.";

            loginMessage.style.color = "red";

            return;
        }


        loginMessage.textContent = "";

        loginBox.style.display = "none";

        adminPanel.style.display = "block";


        await loadDashboard();


    } catch (error) {

        console.error(error);


        if (
            error.code === "auth/invalid-credential"
        ) {

            loginMessage.textContent =
                "البريد الإلكتروني أو كلمة المرور غير صحيحة.";

        }

        else if (
            error.code === "auth/user-not-found"
        ) {

            loginMessage.textContent =
                "الحساب غير موجود.";

        }

        else if (
            error.code === "auth/wrong-password"
        ) {

            loginMessage.textContent =
                "كلمة المرور غير صحيحة.";

        }

        else if (
            error.code === "auth/invalid-email"
        ) {

            loginMessage.textContent =
                "البريد الإلكتروني غير صحيح.";

        }

        else {

            loginMessage.textContent =
                "حدث خطأ أثناء تسجيل الدخول.";

            console.error(error);
        }


        loginMessage.style.color = "red";
    }
};


// ======================================
// تسجيل الخروج
// ======================================

window.adminLogout = async function () {

    try {

        await signOut(auth);

        adminPanel.style.display = "none";

        loginBox.style.display = "block";

        passwordInput.value = "";


    } catch (error) {

        console.error(error);
    }
};


// ======================================
// مراقبة حالة تسجيل الدخول
// ======================================

onAuthStateChanged(
    auth,
    async function (user) {

        if (
            user &&
            user.uid === ADMIN_UID
        ) {

            loginBox.style.display = "none";

            adminPanel.style.display = "block";

            await loadDashboard();

        }

        else {

            loginBox.style.display = "block";

            adminPanel.style.display = "none";
        }
    }
);


// ======================================
// تحميل لوحة التحكم
// ======================================

async function loadDashboard() {

    await loadProducts();

    await loadOrders();

    await loadCustomers();
}


// ======================================
// إضافة منتج
// ======================================

window.addProduct = async function () {

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
        document
            .getElementById("productPrice")
            .value
            .trim();


    const category =
        document
            .getElementById("productCategory")
            .value;


    const image =
        document
            .getElementById("productImage")
            .value
            .trim();


    if (
        !name ||
        !price ||
        !image
    ) {

        alert(
            "من فضلك املأ اسم المنتج والسعر ورابط الصورة."
        );

        return;
    }


    try {

        await addDoc(
            collection(db, "products"),
            {

                name: name,

                description: description,

                price: Number(price),

                category: category,

                image: image,

                createdAt:
                    new Date().toISOString()
            }
        );


        alert(
            "تم إضافة المنتج بنجاح."
        );


        document
            .getElementById("productName")
            .value = "";


        document
            .getElementById("productDescription")
            .value = "";


        document
            .getElementById("productPrice")
            .value = "";


        document
            .getElementById("productImage")
            .value = "";


        await loadProducts();


        await updateStats();


    } catch (error) {

        console.error(error);

        alert(
            "حدث خطأ أثناء إضافة المنتج."
        );
    }
};


// ======================================
// تحميل المنتجات
// ======================================

async function loadProducts() {

    const container =
        document.getElementById(
            "productsList"
        );


    if (!container) return;


    container.innerHTML =
        "<p>جاري تحميل المنتجات...</p>";


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "products"
                )
            );


        if (snapshot.empty) {

            container.innerHTML =
                "<p>لا توجد منتجات حاليًا.</p>";

            updateStat(
                "productsCount",
                0
            );

            return;
        }


        container.innerHTML = "";


        let count = 0;


        snapshot.forEach(
            function (productDoc) {

                count++;


                const product =
                    productDoc.data();


                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "admin-product";


                const image =
                    product.image
                        ? `
                            <img
                                src="${escapeHtml(product.image)}"
                                alt="${escapeHtml(product.name || "")}"
                                onerror="this.style.display='none'"
                            >
                          `
                        : `
                            <div>
                                بدون صورة
                            </div>
                          `;


                div.innerHTML = `

                    ${image}

                    <div class="admin-product-info">

                        <h3>
                            ${escapeHtml(
                                product.name || ""
                            )}
                        </h3>

                        <p>
                            ${escapeHtml(
                                product.description || ""
                            )}
                        </p>

                        <strong>
                            ${escapeHtml(
                                String(product.price || 0)
                            )}
                            جنيه
                        </strong>

                        <p>
                            القسم:
                            ${escapeHtml(
                                product.category || ""
                            )}
                        </p>

                    </div>

                    <button
                        class="delete-button"
                        onclick="deleteProduct('${productDoc.id}')"
                    >
                        حذف
                    </button>

                `;


                container.appendChild(div);
            }
        );


        updateStat(
            "productsCount",
            count
        );


    } catch (error) {

        console.error(error);

        container.innerHTML =
            "<p>حدث خطأ أثناء تحميل المنتجات.</p>";
    }
}


// ======================================
// حذف منتج
// ======================================

window.deleteProduct = async function (
    productId
) {

    const confirmed =
        confirm(
            "هل أنت متأكد من حذف هذا المنتج؟"
        );


    if (!confirmed) return;


    try {

        await deleteDoc(
            doc(
                db,
                "products",
                productId
            )
        );


        alert(
            "تم حذف المنتج بنجاح."
        );


        await loadProducts();

        await updateStats();


    } catch (error) {

        console.error(error);

        alert(
            "حدث خطأ أثناء حذف المنتج."
        );
    }
};


// ======================================
// تحميل الطلبات
// ======================================

async function loadOrders() {

    const container =
        document.getElementById(
            "ordersList"
        );


    if (!container) return;


    container.innerHTML =
        "<p>جاري تحميل الطلبات...</p>";


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "orders"
                )
            );


        if (snapshot.empty) {

            container.innerHTML =
                "<p>لا توجد طلبات حاليًا.</p>";

            updateStat(
                "ordersCount",
                0
            );

            return;
        }


        container.innerHTML = "";


        let count = 0;


        snapshot.forEach(
            function (orderDoc) {

                count++;


                const order =
                    orderDoc.data();


                const items =
                    Array.isArray(order.items)
                        ? order.items
                        : [];


                let itemsHTML = "";


                items.forEach(
                    function (item) {

                        itemsHTML += `

                            <li>

                                ${escapeHtml(
                                    item.name || ""
                                )}

                                ×

                                ${escapeHtml(
                                    String(
                                        item.quantity || 1
                                    )
                                )}

                            </li>

                        `;
                    }
                );


                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "admin-card";


                div.innerHTML = `

                    <h3>
                        طلب رقم:
                        ${escapeHtml(
                            orderDoc.id
                        )}
                    </h3>

                    <p>
                        <strong>
                            الاسم:
                        </strong>

                        ${escapeHtml(
                            order.customerName || ""
                        )}
                    </p>

                    <p>
                        <strong>
                            الهاتف:
                        </strong>

                        ${escapeHtml(
                            order.phone || ""
                        )}
                    </p>

                    <p>
                        <strong>
                            العنوان:
                        </strong>

                        ${escapeHtml(
                            order.address || ""
                        )}
                    </p>

                    <p>
                        <strong>
                            الإجمالي:
                        </strong>

                        ${escapeHtml(
                            String(
                                order.total || 0
                            )
                        )}
                        جنيه
                    </p>

                    <h4>
                        المنتجات:
                    </h4>

                    <ul>
                        ${itemsHTML}
                    </ul>

                `;


                container.appendChild(div);
            }
        );


        updateStat(
            "ordersCount",
            count
        );


    } catch (error) {

        console.error(error);

        container.innerHTML =
            "<p>حدث خطأ أثناء تحميل الطلبات.</p>";
    }
}


// ======================================
// تحميل العملاء
// ======================================

async function loadCustomers() {

    const container =
        document.getElementById(
            "customersList"
        );


    if (!container) return;


    container.innerHTML =
        "<p>جاري تحميل العملاء...</p>";


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "customers"
                )
            );


        if (snapshot.empty) {

            container.innerHTML =
                "<p>لا يوجد عملاء حاليًا.</p>";

            updateStat(
                "customersCount",
                0
            );

            return;
        }


        container.innerHTML = "";


        let count = 0;


        snapshot.forEach(
            function (customerDoc) {

                count++;


                const customer =
                    customerDoc.data();


                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "admin-card";


                div.innerHTML = `

                    <h3>
                        ${escapeHtml(
                            customer.name || ""
                        )}
                    </h3>

                    <p>
                        البريد:
                        ${escapeHtml(
                            customer.email || ""
                        )}
                    </p>

                    <p>
                        الهاتف:
                        ${escapeHtml(
                            customer.phone || ""
                        )}
                    </p>

                    <p>
                        العنوان:
                        ${escapeHtml(
                            customer.address || ""
                        )}
                    </p>

                `;


                container.appendChild(div);
            }
        );


        updateStat(
            "customersCount",
            count
        );


    } catch (error) {

        console.error(error);

        container.innerHTML =
            "<p>حدث خطأ أثناء تحميل العملاء.</p>";
    }
}


// ======================================
// تحديث الإحصائيات
// ======================================

async function updateStats() {

    try {

        const productsSnapshot =
            await getDocs(
                collection(
                    db,
                    "products"
                )
            );


        const customersSnapshot =
            await getDocs(
                collection(
                    db,
                    "customers"
                )
            );


        const ordersSnapshot =
            await getDocs(
                collection(
                    db,
                    "orders"
                )
            );


        updateStat(
            "productsCount",
            productsSnapshot.size
        );


        updateStat(
            "customersCount",
            customersSnapshot.size
        );


        updateStat(
            "ordersCount",
            ordersSnapshot.size
        );


    } catch (error) {

        console.error(error);
    }
}


// ======================================
// تحديث رقم إحصائية
// ======================================

function updateStat(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;
    }
}


// ======================================
// حماية النصوص
// ======================================

function escapeHtml(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}
