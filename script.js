document.addEventListener('DOMContentLoaded', () => {
    let items = [
        // DUMMY data
        // { name: 'Item 1', price: 20, imageUrl: 'https://sr12herbalskincare.co.id/minio/websr12/1714979636959.jpg', net: '30 mL' },
        // { name: 'Item 2', price: 10, imageUrl: 'https://example.com/image2.jpg', net: '60 mL' },
        // { name: 'Item 3', price: 30, imageUrl: 'https://example.com/image3.jpg', net: '100 gr' },
    ];
    let cart = [];
    let data = [];

    const toggleViewBtn = document.getElementById('toggle-view-btn');
    const itemsContainer = document.getElementById('items-container');
    const checkoutSide = document.getElementById('checkout-side');
    const overlay = document.getElementById('overlay');
    const basketBtn = document.getElementById('basket-btn');
    const checkoutBtn = document.getElementById('checkout-btn');
    const customerNameInput = document.getElementById('customer-name');
    const customerPhoneInput = document.getElementById('customer-phone');
    const hideCheckoutBtn = document.getElementById('hide-checkout-btn');
    const form = document.getElementById('checkout-form');
    const customerName = document.getElementById('customer-name').value;
    const customerPhone = document.getElementById('customer-phone').value;

    function fetchItems() {
        //First sheet
        let SHEET_ID = '1mEZqLXC29_-hTXZbjTAsHwlYS6PXAOw3XYMCOmTDRYU';
        let SHEET_TITLE = 'products';
        let SHEET_RANGE = 'A2:E';

        let FULL_URL = 'https://docs.google.com/spreadsheets/d/' 
            + SHEET_ID + '/gviz/tq?sheet=' 
            + SHEET_TITLE + '&range=' 
            + SHEET_RANGE;

        fetch(FULL_URL) // Point to google sheets data
            .then(res => res.text())
            .then(rep => {
                const rawData = JSON.parse(rep.substr(47).slice(0, -2));

                for (let i = 0; i < rawData.table.rows.length; i++) {
                    let row = rawData.table.rows[i].c;
                    let simplifiedRow = {
                        name: row[1].v,        // Product name
                        price: row[2].v,       // Product price
                        imageUrl: row[3].v,       // Product image URL
                        net: row[4].v      // Product net
                    };
                    data.push(simplifiedRow);
                }

                items = data;
                renderItems();
            })
            .catch(error => console.error('Error fetching data:', error));

        //Second sheet
        let SHEET_ID2 = '1mEZqLXC29_-hTXZbjTAsHwlYS6PXAOw3XYMCOmTDRYU';
        let SHEET_TITLE2 = 'details';
        let SHEET_RANGE2 = 'A2:B';

        let FULL_URL2 = 'https://docs.google.com/spreadsheets/d/' 
            + SHEET_ID2 + '/gviz/tq?sheet=' 
            + SHEET_TITLE2 + '&range=' 
            + SHEET_RANGE2;

        fetch(FULL_URL2) // Point to google sheets data
            .then(res => res.text())
            .then(rep => {
                const rawData2 = JSON.parse(rep.substr(47).slice(0, -2));

                for (let i = 0; i < rawData2.table.rows.length; i++) {
                    let row = data[i];
                    row.details = rawData2.table.rows[i].c[1].v;

                    const { details, ...rest } = row;
                    row = { ...rest, details };
                }

                console.log(data);
                renderItems();
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    function renderItems(filteredItems = items) {
        itemsContainer.innerHTML = filteredItems.map(item => `
            <div class="item-card">
                <img src="${item.imageUrl}" alt="${item.name}">
                <div class="item-info">
                    <h3>${item.name}</h3>
                    <p>Net: ${item.net}</p>
                    <p>Rp.${item.price}</p>
                    <button onclick="addToCart('${item.name}', ${item.price})">Add Item</button>
                </div>
                <div class="item-details">
                    <!-- Scrollable content goes here -->
                    <p>${item.details}</p>
                </div>
            </div>
        `).join('');
    }

    function applyTitleStyles() {
        const itemTitles = document.querySelectorAll('.item-info h3');

        //Item names styling
        itemTitles.forEach(title => {
            const wordCount = title.textContent.trim().split(/\s+/).length;
            const isSmallScreen = window.matchMedia("(max-width: 768px)").matches;
            const hasListViewClass = itemsContainer.classList.contains('list-view');

            if (wordCount >= 2 && isSmallScreen && hasListViewClass) {
                // Apply multi-line clamp style for titles with 2 or more words
                title.style.display = '-webkit-box';
                title.style.webkitBoxOrient = 'vertical';
                title.style.webkitLineClamp = '2';
                title.style.overflow = 'hidden';
                title.style.textOverflow = 'ellipsis';
                title.style.lineHeight = '0.99';
            } else if (isSmallScreen && hasListViewClass) {
                // Apply single-line overflow style for titles with less than 2 words
                title.style.maxWidth = '10ch';
                title.style.overflow = 'hidden';
                title.style.textOverflow = 'ellipsis';
                title.style.whiteSpace = 'nowrap';
            } else {
                title.style.display = '';
                title.style.webkitBoxOrient = '';
                title.style.webkitLineClamp = '';
                title.style.overflow = '';
                title.style.textOverflow = '';
                title.style.lineHeight = '';
                title.style.maxWidth = '';
                title.style.whiteSpace = '';
            }
        });
    }

    window.addToCart = function(name, price) {
        cart.push({ name, price });
        updateBasket();
    };

    function updateBasket() {
        basketBtn.innerHTML = `<i class="fas fa-shopping-cart"></i> (${cart.length})`;
        updateCheckoutContent();
    }

    function updateCheckoutContent() {
        const checkoutContent = document.getElementById('checkout-content');
        const groupedItems = cart.reduce((acc, item) => {
            acc[item.name] = (acc[item.name] || 0) + 1;
            return acc;
        }, {});
        let totalPrice = 0;

        checkoutContent.innerHTML = Object.keys(groupedItems).map(name => {
            const price = items.find(item => item.name === name).price;
            const quantity = groupedItems[name];
            totalPrice += price * quantity;
            return `
                <div class="checkout-item">
                    <span>${name} x${quantity}</span>
                    <span>Rp.${price.toFixed(2)}/pcs<br></span>
                    <span>Rp.${(price * quantity).toFixed(2)}<br></span>
                </div>
            `;
        }).join('') + `<hr><div class="checkout-total">Total: Rp. ${totalPrice.toFixed(2)}</div>`;

        checkoutBtn.disabled = !customerNameInput.value || !customerPhoneInput.value || !totalPrice;
    }

    function toggleCheckoutSide() {
        checkoutSide.classList.toggle('show');
        overlay.style.display = checkoutSide.classList.contains('show') ? 'block' : 'none';
    }

    function hideCheckoutSide() {
        checkoutSide.classList.remove('show');
        overlay.style.display = 'none';
    }

    basketBtn.addEventListener('click', toggleCheckoutSide);
    hideCheckoutBtn.addEventListener('click', hideCheckoutSide);
    overlay.addEventListener('click', hideCheckoutSide);

    function getOrderSummary() {
        const checkoutItems = document.querySelectorAll('.checkout-item');
        const checkoutTotal = document.querySelector('.checkout-total');
        let orderedItems = '';

        checkoutItems.forEach(item => {
            orderedItems += item.querySelector('span:nth-child(1)').innerText
            + item.querySelector('span:nth-child(2)').innerText + '%0A'
            + item.querySelector('span:nth-child(3)').innerText + '%0A';
        });

        if (checkoutTotal) {
            orderedItems += '______________' + '%0A' 
            + checkoutTotal.innerText;
        }
    
        return orderedItems;
    }

    async function sendMessage() {
        const orderedItems = getOrderSummary();
        console.log(orderedItems);
        const messageText = "<i>Assalamu'alaikum...</i>%0A"
            + "<b>Pesanan%20baru</b>%0A"
            + "Nama%20pelanggan:%20" + customerName + "%0A"
            + "Nomor%20telepon%20pelanggan:%20" + customerPhone + "%0A%0A"
            + "<u>Barang%20pesanan</u>" + "%0A"
            + orderedItems + "%0A"
            + "<i>Syukran...</i>";
        console.log(messageText);

        const botToken = '7130683967:AAFOfjuhNH_1VNb3U-VOj5FH5BC8AEn8XCo';
        const chatId = '-1002241455688';
        let url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${messageText}&parse_mode=HTML`;

        let api = new XMLHttpRequest();

        api.open("GET", url, true);
        api.send();
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (customerNameInput.value && customerPhoneInput.value) {
            sendMessage();
        }
    });

    document.getElementById('search').addEventListener('input', (event) => {
        const query = event.target.value.toLowerCase();
        const filteredItems = items.filter(item => item.name.toLowerCase().includes(query));
        renderItems(filteredItems);
    });

    document.getElementById('sort-options').addEventListener('change', (event) => {
        const value = event.target.value;
        let sortedItems = [...items];
        switch (value) {
            case 'name-asc':
                sortedItems.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                sortedItems.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'price-asc':
                sortedItems.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                sortedItems.sort((a, b) => b.price - a.price);
                break;
            default:
                sortedItems = [...items];
        }
        renderItems(sortedItems);
    });

    const details = Array.from(document.getElementsByClassName('item-details'));

    toggleViewBtn.addEventListener('click', () => {
        if (itemsContainer.classList.contains('list-view')) {
            itemsContainer.classList.remove('list-view');
            itemsContainer.classList.add('grid-view');
            toggleViewBtn.innerHTML = '<i class="fas fa-list"></i> List View';
            details.forEach(detail => {
                detail.style.display = 'none';
            });
        } else {
            itemsContainer.classList.remove('grid-view');
            itemsContainer.classList.add('list-view');
            toggleViewBtn.innerHTML = '<i class="fas fa-th"></i> Grid View';
            details.forEach(detail => {
                detail.style.display = 'block';
            });
            
            applyTitleStyles();
        }
    });

    customerNameInput.addEventListener('input', updateCheckoutContent);
    customerPhoneInput.addEventListener('input', updateCheckoutContent);

    // Initial render
    renderItems();
    fetchItems();

    //Detect if window size changes
    window.addEventListener('resize' ,() => {
        if (window.innerWidth) {
            applyTitleStyles();
        } else {
            return;
        }
    })
});
