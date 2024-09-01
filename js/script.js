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
    const customerAddressInput = document.getElementById('customer-address');
    const hideCheckoutBtn = document.getElementById('hide-checkout-btn');
    const form = document.forms['checkout-form'];
    const loader = document.querySelector('.loader');
    const mainCard = document.querySelector('#main-card');

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
                        name: row[1].v,
                        price: row[2].v,
                        imageUrl: row[3].v,
                        net: row[4].v
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
                showMainCard();
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    function formatPrice(number) {
        const numberStr = number.toString();
    
        const formattedNumber = numberStr.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
    
        return formattedNumber + ",00";
    }

    function convertToSlug(inputString) {
        return inputString.replace(/\s+/g, '-').toLowerCase();
    }

    function renderItems(filteredItems = items) {
        itemsContainer.innerHTML = filteredItems.map(item => `
            <div class="item-card" id="${convertToSlug(item.name)}">
                <img src="${item.imageUrl}" alt="${item.name}" loading="lazy">
                <div class="item-info">
                    <h3>${item.name}</h3>
                    <p>Net: ${item.net}</p>
                    <p>Rp.${formatPrice(item.price)}</p>
                    <button class="add-to-cart-btn" onclick="addToCart('${item.name}', ${item.price})">Add Item</button>
                </div>
                <div class="item-details">
                    <pre>${item.details}</pre>
                </div>
            </div>
        `).join('');
        applyTitleStyles();
    }

    function showMainCard() {
        document.querySelectorAll('.item-card').forEach((item) => {
            item.addEventListener('click', (e) => {
                if (event.target.closest('button.add-to-cart-btn')) {
                    return;
                }

                const itemContent = item.innerHTML;
                mainCard.innerHTML = itemContent;
                mainCard.classList.add('show');
                overlay.style.display = 'block';
            });
        });
    }

    function applyTitleStyles() {
        const itemTitles = document.querySelectorAll('.item-info h3');

        //Item names styling
        itemTitles.forEach(title => {
            const wordCount = title.textContent.trim().split(/\s+/).length;
            const isSmallScreen = window.matchMedia("(max-width: 768px)").matches;
            const isGrid = itemsContainer.classList.contains('grid-view');

            if (wordCount >= 2 && isSmallScreen) {
                // Apply multi-line clamp style for titles with 2 or more words
                title.style.display = '-webkit-box';
                title.style.webkitBoxOrient = 'vertical';
                title.style.webkitLineClamp = '2';
                title.style.overflow = 'hidden';
                title.style.textOverflow = 'ellipsis';
                title.style.lineHeight = '0.995';
            } else if (isSmallScreen && isGrid) {
                // Apply single-line overflow style for titles with less than 2 words
                title.style.maxWidth = '11ch';
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
                    <span>Rp.${formatPrice(price)}/pcs<br></span>
                    <span>Rp.${formatPrice(price * quantity)}<br></span>
                </div>
            `;
        }).join('') + `<hr><div class="checkout-total">Total: Rp. ${formatPrice(totalPrice)}</div>`;

        checkoutBtn.disabled = !customerNameInput.value || !customerPhoneInput.value || !totalPrice;
    }

    function toggleCheckoutSide() {
        checkoutSide.classList.toggle('show');
        overlay.style.display = checkoutSide.classList.contains('show') ? 'block' : 'none';
    }

    function hideWindow() {
        checkoutSide.classList.remove('show');
        mainCard.classList.remove('show');
        mainCard.innerHTML = '';
        overlay.style.display = 'none';
    }

    basketBtn.addEventListener('click', toggleCheckoutSide);
    hideCheckoutBtn.addEventListener('click', hideWindow);
    overlay.addEventListener('click', hideWindow);

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

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        loader.style.display = "block";
        document.querySelector("#loader-overlay").style.display = "block";
        console.log(new FormData(form));
        if (customerNameInput.value && customerPhoneInput.value) {
            const orderedItems = getOrderSummary();
            console.log(orderedItems);
            const data = {
                customerName: customerNameInput.value,
                customerPhone: customerPhoneInput.value,
                address: customerAddressInput.value,
                orderedItems: orderedItems
            };

            try {
                // https://server-katalog-sr12-49cf77b978e6.herokuapp.com/send-message
                const response1 = await fetch('http://localhost:3000/send-message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const response2 = await fetch('https://script.google.com/macros/s/AKfycbwtqu-AExl9M9C25tcmu-RagBcpj2s_RjaJOYHAViN0KulipYcO1QxcfYVOzXfYmCicGg/exec', {
                    method: 'POST',
                    body: new FormData(form)
                });

                const result1 = await response1.text();
                const result2 = await response2.text();
                console.log(result1, result2);
                console.log(result2);

                if (response1.ok && response2.ok) {
                    alert("Pesanan terkirim!\nTerimakasih....");
                    location.reload();
                }
            } catch (error) {
                console.error('Error:', error);
            }
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
        applyTitleStyles()
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
    setTimeout(showMainCard, 100);

    //Detect if window size changes
    window.addEventListener('resize' ,() => {
        if (window.innerWidth) {
            applyTitleStyles();
        } else {
            return;
        }
    })
});
