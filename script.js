// ================================
// نظام حسابات زين
// ================================

// إظهار التسجيل
function showRegister() {
    document.getElementById("registerBox").classList.remove("auth-hidden");
    document.getElementById("loginBox").classList.add("auth-hidden");
    document.getElementById("forgotBox").classList.add("auth-hidden");
}

// إظهار تسجيل الدخول
function showLogin() {
    document.getElementById("registerBox").classList.add("auth-hidden");
    document.getElementById("loginBox").classList.remove("auth-hidden");
    document.getElementById("forgotBox").classList.add("auth-hidden");
}

// إظهار استرجاع كلمة المرور
function showForgotPassword() {
    document.getElementById("registerBox").classList.add("auth-hidden");
    document.getElementById("loginBox").classList.add("auth-hidden");
    document.getElementById("forgotBox").classList.remove("auth-hidden");
}


// ================================
// إنشاء حساب جديد
// ================================

function registerCustomer() {

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim().toLowerCase();
    const phone = document.getElementById("registerPhone").value.trim();
    const address = document.getElementById("registerAddress").value.trim();

    const password = document.getElementById("registerPassword").value;
    const passwordConfirm =
        document.getElementById("registerPasswordConfirm").value;

    const fatherName =
        document.getElementById("fatherName").value.trim();

    const message =
        document.getElementById("registerMessage");


    // التأكد من إدخال البيانات
    if (
        !name ||
        !email ||
        !phone ||
        !address ||
        !password ||
        !passwordConfirm ||
        !fatherName
    ) {
        message.textContent = "من فضلك املأ جميع البيانات.";
        message.style.color = "red";
        return;
    }


    // التحقق من كلمة المرور
    if (password.length < 6) {
        message.textContent =
            "كلمة المرور يجب أن تكون 6 أحرف على الأقل.";

        message.style.color = "red";
        return;
    }


    // التأكد من تطابق كلمتي المرور
    if (password !== passwordConfirm) {
        message.textContent =
            "كلمتا المرور غير متطابقتين.";

        message.style.color = "red";
        return;
    }


    // التأكد أن البريد غير مسجل
    const existingCustomer =
        localStorage.getItem("zainCustomer_" + email);

    if (existingCustomer) {
        message.textContent =
            "هذا البريد الإلكتروني مسجل بالفعل.";

        message.style.color = "red";
        return;
    }


    // بيانات العميل
    const customer = {

        name: name,

        email: email,

        phone: phone,

        address: address,

        password: password,

        fatherName: fatherName
    };


    // حفظ الحساب
    localStorage.setItem(
        "zainCustomer_" + email,
        JSON.stringify(customer)
    );


    // تسجيل الدخول تلقائيًا
    localStorage.setItem(
        "zainLoggedIn",
        email
    );


    alert("تم إنشاء حسابك بنجاح ❤️");


    // إغلاق شاشة التسجيل
    document.getElementById("authOverlay").style.display = "none";
}



// ================================
// تسجيل الدخول
// ================================

function loginCustomer() {

    const email =
        document.getElementById("loginEmail").value.trim().toLowerCase();

    const password =
        document.getElementById("loginPassword").value;

    const message =
        document.getElementById("loginMessage");


    // البحث عن الحساب
    const savedCustomer =
        localStorage.getItem("zainCustomer_" + email);


    if (!savedCustomer) {

        message.textContent =
            "البريد الإلكتروني غير مسجل.";

        message.style.color = "red";

        return;
    }


    const customer =
        JSON.parse(savedCustomer);


    // التحقق من كلمة المرور
    if (customer.password !== password) {

        message.textContent =
            "كلمة المرور غير صحيحة.";

        message.style.color = "red";

        return;
    }


    // حفظ تسجيل الدخول
    localStorage.setItem(
        "zainLoggedIn",
        email
    );


    // إخفاء شاشة الحساب
    document.getElementById("authOverlay").style.display = "none";


    alert(
        "أهلاً بك يا " +
        customer.name +
        " ❤️"
    );
}



// ================================
// نسيت كلمة المرور
// ================================

function resetPassword() {

    const email =
        document.getElementById("forgotEmail").value.trim().toLowerCase();

    const fatherName =
        document.getElementById("forgotFatherName").value.trim();

    const message =
        document.getElementById("forgotMessage");


    // البحث عن الحساب
    const savedCustomer =
        localStorage.getItem("zainCustomer_" + email);


    if (!savedCustomer) {

        message.textContent =
            "لم نجد حسابًا بهذا البريد الإلكتروني.";

        message.style.color = "red";

        return;
    }


    const customer =
        JSON.parse(savedCustomer);


    // التحقق من إجابة سؤال الأمان
    if (customer.fatherName !== fatherName) {

        message.textContent =
            "إجابة سؤال الأمان غير صحيحة.";

        message.style.color = "red";

        return;
    }


    // حفظ البريد مؤقتًا
    sessionStorage.setItem(
        "zainResetEmail",
        email
    );


    message.textContent =
        "تم التحقق بنجاح. اكتب كلمة المرور الجديدة.";

    message.style.color = "green";


    // إظهار كلمة المرور الجديدة
    document
        .getElementById("newPasswordArea")
        .classList.remove("auth-hidden");
}



// ================================
// حفظ كلمة المرور الجديدة
// ================================

function saveNewPassword() {

    const newPassword =
        document.getElementById("newPassword").value;

    const confirmPassword =
        document.getElementById("newPasswordConfirm").value;

    const message =
        document.getElementById("forgotMessage");

    const email =
        sessionStorage.getItem("zainResetEmail");


    if (!email) {

        message.textContent =
            "حدث خطأ. ابدأ عملية الاسترجاع من جديد.";

        message.style.color = "red";

        return;
    }


    // التحقق من طول كلمة المرور
    if (newPassword.length < 6) {

        message.textContent =
            "كلمة المرور يجب أن تكون 6 أحرف على الأقل.";

        message.style.color = "red";

        return;
    }


    // التأكد من التطابق
    if (newPassword !== confirmPassword) {

        message.textContent =
            "كلمتا المرور غير متطابقتين.";

        message.style.color = "red";

        return;
    }


    // جلب بيانات العميل
    const savedCustomer =
        localStorage.getItem("zainCustomer_" + email);


    if (!savedCustomer) {

        message.textContent =
            "لم نجد الحساب.";

        message.style.color = "red";

        return;
    }


    const customer =
        JSON.parse(savedCustomer);


    // تغيير كلمة المرور
    customer.password = newPassword;


    // حفظ البيانات الجديدة
    localStorage.setItem(
        "zainCustomer_" + email,
        JSON.stringify(customer)
    );


    // حذف جلسة الاسترجاع
    sessionStorage.removeItem(
        "zainResetEmail"
    );


    alert(
        "تم تغيير كلمة المرور بنجاح ❤️"
    );


    // العودة لتسجيل الدخول
    showLogin();
}



// ================================
// زر التواصل
// ================================

function showMessage() {

    alert(
        "أهلاً بك في زين للملابس الجاهزة ❤️"
    );
}



// ================================
// أزرار اطلب الآن
// ================================

function setupProductButtons() {

    const buttons =
        document.querySelectorAll(".product button");


    buttons.forEach(function(button) {

        button.addEventListener("click", function() {


            // التأكد من تسجيل الدخول
            const loggedInEmail =
                localStorage.getItem("zainLoggedIn");


            if (!loggedInEmail) {

                alert(
                    "من فضلك سجل الدخول أولاً."
                );

                return;
            }


            // اسم المنتج
            const product =
                this.parentElement
                    .querySelector("h3")
                    .textContent;


            // رقم واتساب زين
            const phone =
                "201550154020";


            // بيانات العميل
            const savedCustomer =
                localStorage.getItem(
                    "zainCustomer_" + loggedInEmail
                );


            if (!savedCustomer) {

                alert(
                    "لم يتم العثور على بيانات حسابك."
                );

                return;
            }


            const customer =
                JSON.parse(savedCustomer);


            // رسالة الطلب
            const message =
                "مرحباً، أريد طلب منتج: " +
                product +

                "\nالاسم: " +
                customer.name +

                "\nرقم الهاتف: " +
                customer.phone +

                "\nالعنوان: " +
                customer.address;


            // إنشاء رابط واتساب
            const whatsapp =
                "https://wa.me/" +
                phone +
                "?text=" +
                encodeURIComponent(message);


            // فتح واتساب
            window.open(
                whatsapp,
                "_blank"
            );

        });

    });

}



// ================================
// عند فتح الموقع
// ================================

window.addEventListener(
    "DOMContentLoaded",
    function() {


        // هل يوجد تسجيل دخول؟
        const loggedIn =
            localStorage.getItem("zainLoggedIn");


        if (loggedIn) {

            document
                .getElementById("authOverlay")
                .style.display = "none";
        }


        // تشغيل أزرار المنتجات
        setupProductButtons();

    }
);