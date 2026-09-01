// ================================
// DAIRY SALES MANAGER
// ================================


// LOAD CUSTOMERS

let customers =
    JSON.parse(localStorage.getItem("customers")) || [];


// LOAD SALES

let sales =
    JSON.parse(localStorage.getItem("sales")) || [];


// LOAD MILK PRICE

let milkPrice =
    Number(localStorage.getItem("milkPrice")) || 55;

let payments =
    JSON.parse(localStorage.getItem("payments")) || [];
// ================================
// INITIALIZE APP
// ================================

window.onload = function () {

    // Show saved milk price

    document.getElementById("milkPrice").value =
        milkPrice;


    // Set today's date

    const today = new Date()
        .toISOString()
        .split("T")[0];

    document.getElementById("saleDate").value =
        today;


    displayCustomers();

    displayPaymentCustomers();

    displayCustomerHistory();

    displayDailySales();

    updateDashboard();
    setDefaultDates();

    displayCustomers();

    displayMonthlyBills();

    displayPaymentHistory();
};


// ================================
// SAVE MILK PRICE
// ================================

function saveMilkPrice() {

    const priceInput =
        document.getElementById("milkPrice");

    const newPrice =
        Number(priceInput.value);


    if (newPrice <= 0) {

        alert("Please enter a valid price");

        return;
    }


    milkPrice = newPrice;


    localStorage.setItem(
        "milkPrice",
        milkPrice
    );


    displayDailySales();

    alert("Milk price saved!");
}


// ================================
// ADD CUSTOMER
// ================================

function addCustomer() {

    const name =
        document.getElementById("customerName")
        .value
        .trim();


    const phone =
        document.getElementById("customerPhone")
        .value
        .trim();


    if (name === "") {

        alert("Please enter customer name");

        return;
    }


    const customer = {

        id: Date.now(),

        name: name,

        phone: phone
    };


    customers.push(customer);


    localStorage.setItem(
        "customers",
        JSON.stringify(customers)
    );


    document.getElementById("customerName").value = "";

    document.getElementById("customerPhone").value = "";


    displayCustomers();

    displayPaymentCustomers();

    displayDailySales();

    updateDashboard();
}


// ================================
// DISPLAY CUSTOMERS
// ================================

function displayCustomers() {

    const customerList =
        document.getElementById("customerList");


    customerList.innerHTML = "";


    customers.forEach(function (customer) {

        customerList.innerHTML += `

            <div class="customer">

                <h3>👤 ${customer.name}</h3>

                <p>📞 ${customer.phone || "No phone number"}</p>

            </div>

        `;
    });
}


// ================================
// DISPLAY DAILY SALES
// ================================

function displayDailySales() {

    const dailySalesList =
        document.getElementById("dailySalesList");


    dailySalesList.innerHTML = "";


    customers.forEach(function (customer) {

        dailySalesList.innerHTML += `

            <div class="customer">

                <h3>👤 ${customer.name}</h3>

                <div class="sale-buttons">

                    <button onclick="saveSale(${customer.id}, 0)">
                        No Sale
                    </button>

                    <button onclick="saveSale(${customer.id}, 250)">
                        250 ml
                    </button>

                    <button onclick="saveSale(${customer.id}, 500)">
                        500 ml
                    </button>

                    <button onclick="saveSale(${customer.id}, 1000)">
                        1 Liter
                    </button>

                </div>

                <div class="sale-amount"
                     id="amount-${customer.id}">

                    Select quantity

                </div>

            </div>

        `;
    });
}

function setDefaultDates() {

    const today = new Date()
        .toISOString()
        .split("T")[0];

    const currentMonth =
        today.substring(0, 7);


    document.getElementById(
        "billingMonth"
    ).value = currentMonth;


    document.getElementById(
        "paymentDate"
    ).value = today;
}
function displayPaymentCustomers() {

    const select =
        document.getElementById("paymentCustomer");


    select.innerHTML =
        '<option value="">Select Customer</option>';


    customers.forEach(function (customer) {

        select.innerHTML += `

            <option value="${customer.id}">
                ${customer.name}
            </option>

        `;
    });

    const historySelect =
        document.getElementById("historyCustomer");

    const selectedCustomerId =
        historySelect.value || "";

    historySelect.innerHTML =
        '<option value="">Choose a customer</option>';

    customers.forEach(function (customer) {

        const selected =
            String(customer.id) === String(selectedCustomerId)
                ? "selected"
                : "";

        historySelect.innerHTML += `

            <option value="${customer.id}" ${selected}>
                ${customer.name}
            </option>

        `;
    });

    if (selectedCustomerId && !customers.some(function (customer) {
        return String(customer.id) === String(selectedCustomerId);
    })) {
        historySelect.value = "";
    }

    displayCustomerHistory();
}

function displayCustomerHistory() {

    const customerHistoryList =
        document.getElementById("customerHistoryList");

    const selectedCustomerId =
        Number(document.getElementById("historyCustomer").value);

    customerHistoryList.innerHTML = "";

    if (!selectedCustomerId) {

        customerHistoryList.innerHTML = `
            <div class="history-empty">
                Select a customer to view their sales by date.
            </div>
        `;

        return;
    }

    const customerSales = sales.filter(function (sale) {
        return sale.customerId === selectedCustomerId;
    });

    if (!customerSales.length) {

        customerHistoryList.innerHTML = `
            <div class="history-empty">
                No sales recorded for this customer yet.
            </div>
        `;

        return;
    }

    const groupedSales = {};

    customerSales.forEach(function (sale) {

        if (!groupedSales[sale.date]) {
            groupedSales[sale.date] = {
                quantity: 0,
                amount: 0
            };
        }

        groupedSales[sale.date].quantity += sale.quantity;
        groupedSales[sale.date].amount += sale.amount;
    });

    const dates = Object.keys(groupedSales)
        .sort(function (a, b) {
            return b.localeCompare(a);
        });

    const totalQuantity = dates.reduce(function (sum, date) {
        return sum + groupedSales[date].quantity;
    }, 0);

    const totalAmount = dates.reduce(function (sum, date) {
        return sum + groupedSales[date].amount;
    }, 0);

    customerHistoryList.innerHTML = `
        <div class="history-summary">
            Total Sales: ${(totalQuantity / 1000).toFixed(2)} L | ₹${totalAmount.toFixed(2)}
        </div>
    `;

    dates.forEach(function (date) {

        const saleData = groupedSales[date];

        customerHistoryList.innerHTML += `
            <div class="history-card">
                <h3>📅 ${new Date(date + "T00:00:00").toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                })}</h3>
                <p>🥛 ${(saleData.quantity / 1000).toFixed(2)} L</p>
                <p>💰 ₹${saleData.amount.toFixed(2)}</p>
            </div>
        `;
    });
}

function displayPaymentHistory() {

    const paymentHistory =
        document.getElementById("paymentHistory");

    paymentHistory.innerHTML = "";

    if (!payments.length) {

        paymentHistory.innerHTML = `
            <div class="history-empty">
                No payment history available yet.
            </div>
        `;

        return;
    }

    const orderedPayments = payments.slice().sort(function (a, b) {
        return b.date.localeCompare(a.date);
    });

    const customerMap = {};
    customers.forEach(function (customer) {
        customerMap[customer.id] = customer.name;
    });

    orderedPayments.forEach(function (payment) {

        paymentHistory.innerHTML += `
            <div class="history-card">
                <h3>👤 ${customerMap[payment.customerId] || "Unknown Customer"}</h3>
                <p>📅 ${new Date(payment.date + "T00:00:00").toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                })}</p>
                <p>💳 ₹${Number(payment.amount).toFixed(2)}</p>
            </div>
        `;
    });
}

function addPayment() {

    const customerId =
        Number(
            document.getElementById(
                "paymentCustomer"
            ).value
        );


    const amount =
        Number(
            document.getElementById(
                "paymentAmount"
            ).value
        );


    const date =
        document.getElementById(
            "paymentDate"
        ).value;


    if (!customerId) {

        alert("Please select a customer");

        return;
    }


    if (!amount || amount <= 0) {

        alert("Please enter a valid payment amount");

        return;
    }


    if (!date) {

        alert("Please select payment date");

        return;
    }


    payments.push({

        id: Date.now(),

        customerId: customerId,

        amount: amount,

        date: date

    });


    localStorage.setItem(
        "payments",
        JSON.stringify(payments)
    );


    document.getElementById(
        "paymentAmount"
    ).value = "";


    alert("Payment saved successfully!");


    displayMonthlyBills();

    displayPaymentHistory();

    displayCustomerHistory();

    updateDashboard();
}
function displayMonthlyBills() {

    const selectedMonth =
        document.getElementById(
            "billingMonth"
        ).value;


    const monthlyBillsList =
        document.getElementById(
            "monthlyBillsList"
        );


    monthlyBillsList.innerHTML = "";


    if (!selectedMonth) {

        return;
    }


    customers.forEach(function (customer) {

        // Get this customer's sales
        // for selected month

        const customerSales =
            sales.filter(function (sale) {

                return (
                    sale.customerId === customer.id &&
                    sale.date.startsWith(selectedMonth)
                );

            });


        // Calculate total milk

        const totalMilk =
            customerSales.reduce(
                function (total, sale) {

                    return total + sale.quantity;

                },
                0
            );


        // Calculate total bill

        const totalBill =
            customerSales.reduce(
                function (total, sale) {

                    return total + sale.amount;

                },
                0
            );


        // Get payments for this customer
        // during selected month

        const customerPayments =
            payments.filter(function (payment) {

                return (
                    payment.customerId === customer.id &&
                    payment.date.startsWith(selectedMonth)
                );

            });


        // Calculate total paid

        const totalPaid =
            customerPayments.reduce(
                function (total, payment) {

                    return total + payment.amount;

                },
                0
            );


        // Calculate pending amount

        const pending =
            totalBill - totalPaid;


        // Display customer bill

        monthlyBillsList.innerHTML += `

            <div class="bill-card">

                <h3>👤 ${customer.name}</h3>

                <p>
                    🥛 Total Milk:
                    ${(totalMilk / 1000).toFixed(2)} L
                </p>

                <p>
                    💰 Total Bill:
                    ₹${totalBill.toFixed(2)}
                </p>

                <p>
                    💳 Paid:
                    ₹${totalPaid.toFixed(2)}
                </p>

                <p class="pending">
                    ⚠️ Pending:
                    ₹${pending.toFixed(2)}
                </p>

            </div>

        `;
    });
}
document.addEventListener(
    "change",
    function (event) {

        if (event.target.id === "billingMonth") {

            displayMonthlyBills();

        }

        if (event.target.id === "historyCustomer") {

            displayCustomerHistory();

        }

    }
);
// ================================
// SAVE DAILY SALE
// ================================

function saveSale(customerId, quantity) {

    const saleDate =
        document.getElementById("saleDate").value;


    if (!saleDate) {

        alert("Please select a date");

        return;
    }


    const amount =
        (quantity / 1000) * milkPrice;


    // Remove previous sale
    // for same customer and date

    sales = sales.filter(function (sale) {

        return !(
            sale.customerId === customerId &&
            sale.date === saleDate
        );

    });


    // Add new sale

    sales.push({

        id: Date.now(),

        customerId: customerId,

        date: saleDate,

        quantity: quantity,

        price: milkPrice,

        amount: amount

    });


    // Save data

    localStorage.setItem(
        "sales",
        JSON.stringify(sales)
    );


    // Update amount on screen

    document.getElementById(
        `amount-${customerId}`
    ).innerText =

        quantity === 0

        ? "❌ No Sale"

        : `🥛 ${quantity} ml | ₹${amount}`;


    displayCustomerHistory();

    updateDashboard();
}


// ================================
// UPDATE DASHBOARD
// ================================

function updateDashboard() {

    // TOTAL CUSTOMERS

    document.getElementById(
        "totalCustomers"
    ).innerText = customers.length;


    // TODAY'S DATE

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    // GET TODAY'S SALES

    const todaySalesData =
        sales.filter(function (sale) {

            return sale.date === today;

        });


    // TOTAL MILK

    const totalMilk =
        todaySalesData.reduce(
            function (total, sale) {

                return total + sale.quantity;

            },
            0
        );


    // TOTAL MONEY

    const totalMoney =
        todaySalesData.reduce(
            function (total, sale) {

                return total + sale.amount;

            },
            0
        );


    document.getElementById(
        "todayMilk"
    ).innerText =

        (totalMilk / 1000) + " L";


    document.getElementById(
        "todaySales"
    ).innerText =

        "₹" + totalMoney.toFixed(2);
}


// ================================
// CHANGE DATE
// ================================

document.addEventListener(
    "change",
    function (event) {

        if (event.target.id === "saleDate") {

            displayDailySales();

        }

    }
);


// ================================
// SERVICE WORKER
// ================================

if ("serviceWorker" in navigator) {

    navigator.serviceWorker.register(
        "./service-worker.js"
    );

}