const cashfree = Cashfree({
  mode: "sandbox",
});

const payBtn = document.getElementById("payBtn");

payBtn.addEventListener("click", async () => {
  try {
    const amount = 199;
    const phone = document.getElementById("phone").value;

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    const response = await axios.post(
      "http://localhost:3000/order/add-order",
      {
        amount,
        phone,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = response.data; // ✅ correct

    if (!data.paymentSessionId) {
      alert("Failed to create order");
      return;
    }

    // 💳 Open Cashfree Checkout
    const checkoutOptions = {
      paymentSessionId: data.paymentSessionId,
      redirectTarget: "_self",
    };

    cashfree.checkout(checkoutOptions);
  } catch (error) {
    console.log("FULL ERROR:", error);
    console.log("RESPONSE:", error.response);
    console.log("DATA:", error.response?.data);

    alert(error.response?.data?.message || error.message);
  }
});
