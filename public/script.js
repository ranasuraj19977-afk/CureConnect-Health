// Frontend logic: connects to the backend API created in the project root.
// - POST /api/text-consult for free consults
// - POST /api/create-checkout-session for payments (redirects to Stripe Checkout)

async function postJSON(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(data)
  });
  return res.json();
}

document.getElementById('textForm').addEventListener('submit', async function(e){
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  const resultDiv = document.getElementById('textResult');
  resultDiv.innerHTML = 'Sending...';
  try {
    const resp = await postJSON('/api/text-consult', data);
    if (resp.ok) resultDiv.innerHTML = 'Request received. Confirmation sent to ' + data.contact;
    else resultDiv.innerHTML = 'Error: ' + (resp.error || 'unknown');
    e.target.reset();
  } catch (err) {
    resultDiv.innerHTML = 'Network error: ' + err.message;
  }
});

document.getElementById('payButton').addEventListener('click', async function(){
  const form = document.getElementById('videoForm');
  const data = Object.fromEntries(new FormData(form).entries());
  const resultDiv = document.getElementById('videoResult');
  resultDiv.innerHTML = 'Creating payment...';
  try {
    const resp = await postJSON('/api/create-checkout-session', {name: data.vname, contact: data.vcontact, price: Number(data.price)});
    if (resp.url) {
      // redirect to Stripe Checkout
      window.location = resp.url;
    } else {
      resultDiv.innerHTML = 'Error creating checkout: ' + (resp.error || JSON.stringify(resp));
    }
  } catch (err) {
    resultDiv.innerHTML = 'Network error: ' + err.message;
  }
});
