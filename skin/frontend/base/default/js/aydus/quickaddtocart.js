/**
 * QuickAddToCart js
 *
 * @category    Aydus
 * @package     Aydus_QuickAddToCart
 * @author     	Aydus Consulting <davidt@aydus.com>
 */

var quickaddtocart = function ()
{
    //urls to quickaddtocart controller
    var _searchUrl;
    var _addtocartUrl;
    var _cartUrl;
    var _removeItemUrl;

    //forms
    var _searchForm;
    var _addtocartForm;
    var _cartForm;

    //buttons
    var _partsearchButton
    var _checkoutButton;

    //progress selectors
    var _searchProgress;
    var _cartProgress;

    //locks
    var _searching = false;
    var _addingtocart = false;

    //pagination
    var _displayItems = 3;
    var _count = 0;
    var _items = 0;
    var limit = 9;
    var p = 1;

    //perform search
    var search = function ()
    {
        if (!_searching) {

            jQuery(_searchProgress).show();
            jQuery(_partsearchButton).attr('disabled', 'disabled');
            _searching = true;
            var $message = jQuery(_addtocartForm).find('.message');
            $message.html('');

            var data = jQuery(_searchForm).serialize(true);
            //reset previous results
            reset();
            _items = 0;
            _count = 0;

            postSearch(data);
        }
    };

    //post search request
    var postSearch = function (data, callback)
    {
        jQuery.post(_searchUrl, data, function (res) {

            jQuery(_addtocartForm).show();
            var $message = jQuery(_addtocartForm).find('.message');

            if (res.count > 0) {
                _count = res.count;
                var $items = jQuery('.items');
                //new search
                if ($message.html() == '') {
                    $items.css('left', 0);
                    $message.html(' Found ' + res.count + ' items ');
                }
                var items = res.items;
                _items += items.length;
                display(items);
            } else {
                $message.html('No results were found. Please try again.');
            }

            if (jQuery('.part-result').length > 0) {
                jQuery('.part-results').show();
            } else {
                jQuery('.part-results').hide();
            }

            jQuery(_searchProgress).hide();
            jQuery(_partsearchButton).removeAttr('disabled');
            _searching = false;

            if (typeof callback === 'function') {
                callback();
            }

        });
    };

    //clear out unchecked previous results
    var reset = function ()
    {
        jQuery('.part-checkbox').each(function () {

            //@todo removed per TH
            var checked = false; //jQuery(this).is(':checked');

            if (!checked) {

                jQuery(this).parents('.part-result').remove();

            } else {

            }

        });

        if (jQuery('.part-result').length == 0) {
            jQuery(_addtocartForm).hide();
        }
    };

    //scroll results
    var scroll = function (e)
    {
        e.preventDefault();
        var op;
        var next = jQuery(this).hasClass('next');
        var prev = jQuery(this).hasClass('prev');
        var scrollable = false;
        var $message = jQuery(_addtocartForm).find('.message');

        var $items = jQuery('.items');
        $items.attr('pages', p);
        //widths
        var itemsWidth = $items.outerWidth();
        var itemWidth = $items.find('.part-result:eq(0)').outerWidth();
        var displayWidth = itemWidth * _displayItems;
        //current pos
        var itemsLeft = parseInt($items.css('left'), 10);

        //add previous on next
        if (next && jQuery(_addtocartForm).find('.prev').length == 0) {
            $message.prepend('<a href="#" class="prev">&lsaquo; Prev</a>');
            jQuery('.prev').click(scroll);
        } else if (prev && itemsLeft + displayWidth >= 0) {
            $message.find('.prev').remove();
        }

        //scroll left or right
        if (next) {

            op = '-';

            if (Math.abs(itemsLeft) < itemsWidth - displayWidth) {

                scrollable = true;

            } else if (_items < _count) {

                var data = {};
                data.q = jQuery('#part').val();
                data.p = ++p;
                data.limit = limit;

                var callback = function () {
                    animate(op, displayWidth);
                    $items.attr('pages', p);
                };

                jQuery(_searchProgress).show();
                postSearch(data, callback);
            }

        } else if (prev) {

            op = '+';

            if (itemsLeft < 0) {
                scrollable = true;
            }
        }

        if (scrollable) {
            animate(op, displayWidth);
        }

    };

    var animate = function (op, displayWidth)
    {
        var $items = jQuery('.items');
        var itemWidth = $items.find('.part-result:eq(0)').outerWidth();

        var left = op + "=" + displayWidth;

        $items.animate({
            left: left
        }, 500, 'swing', function () {

            var itemsLeft = parseInt($items.css('left'), 10);
            var curPage = (itemsLeft < 0) ? Math.ceil(Math.abs(itemsLeft) / (itemWidth * limit)) : 1;

            $items.attr('cur_page', curPage);
        });
    };

    //display results
    var display = function (items)
    {
        var $items = jQuery(_addtocartForm).find('.items');

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var productId = item.id;

            if (jQuery('#part-' + productId).length == 0) {

                var name = item.name;
                var image = item.image;
                var sku = item.sku;
                var price = item.price;
                var finalPrice = item.final_price;
                var inventories = item.inventories;
                var url = item.url;

                //result container
                var partResult = document.createElement('li');
                partResult.className = 'part-result';
                partResult.id = 'part-' + productId;
                partResult.setAttribute('p', p);

                //result image
                var partImage = document.createElement('div');
                partImage.className = 'part-image';
                var partImageA = document.createElement('a');
                partImageA.href = url;
                var partImg = document.createElement('img');
                partImg.src = image;
                partImageA.appendChild(partImg);
                partImage.appendChild(partImageA);
                partResult.appendChild(partImage);

                //result name
                var partName = document.createElement('div');
                partName.className = 'part-name';
                var partNameA = document.createElement('a');
                partNameA.href = url;
                partNameA.appendChild(document.createTextNode(name));
                partName.appendChild(partNameA);
                partResult.appendChild(partName);

                //result sku
                var partSku = document.createElement('div');
                partSku.className = 'part-sku';
                var partSkuLabel = document.createElement('label');
                partSkuLabel.appendChild(document.createTextNode('Part No.: '));
                partSku.appendChild(partSkuLabel);
                partSku.appendChild(document.createTextNode(sku));
                partResult.appendChild(partSku);

                //result inventories
                /*var partInventory = document.createElement('div');
                 partInventory.className = 'part-inventory';
                 var partInventoryLabel = document.createElement('label');
                 partInventoryLabel.appendChild(document.createTextNode('Availability: '));
                 partInventory.appendChild(partInventoryLabel);
                 partInventory.appendChild(document.createElement('br'));
                 var qtys = 0;
                 for (var j=0; j<inventories.length; j++){
                 
                 var inventory = inventories[j];
                 var warehouse = inventory.warehouse;
                 var qty = inventory.qty;
                 qtys += parseInt(qty);
                 var text = warehouse + ': '+ qty + '';
                 var inventoryText = document.createTextNode(text);
                 partInventory.appendChild(inventoryText);
                 var inventoryTextBr = document.createElement('br');
                 partInventory.appendChild(inventoryTextBr);
                 }
                 partResult.appendChild(partInventory);*/

                // prices
                var partPrice = document.createElement('div');
                partPrice.className = 'part-price';
                var partPriceLabel = document.createElement('label');
                partPriceLabel.appendChild(document.createTextNode('ADP Price: '));
                partPrice.appendChild(partPriceLabel);
                partPrice.appendChild(document.createTextNode(price));
                partResult.appendChild(partPrice);

                var partFinalPrice = document.createElement('div');
                partFinalPrice.className = 'part-price-final';
                var partFinalPriceLabel = document.createElement('label');
                partFinalPriceLabel.appendChild(document.createTextNode('Your Price: '));
                partFinalPrice.appendChild(partFinalPriceLabel);
                partFinalPrice.appendChild(document.createTextNode(finalPrice));
                partResult.appendChild(partFinalPrice);

                //add to cart
                var partAddToCart = document.createElement('div');
                partAddToCart.className = 'part-addtocart';
                var partQtyLabel = document.createElement('label');
                partQtyLabel.className = 'part-qty-label';
                var partQty = document.createElement('input');
                partQty.type = 'text';
                partQty.id = 'part_qty_' + productId;
                partQty.className = 'part-qty input-text qty';
                partQty.name = 'part[qty][]';
                var qtys = 1;
                if (qtys <= 0) {
                    partQty.disabled = true;
                    partQty.value = 0;
                } else {
                    partQty.value = 1;
                }
                partQtyLabel.appendChild(document.createTextNode('Qty: '));
                partQtyLabel.appendChild(partQty);
                partAddToCart.appendChild(partQtyLabel);

                var partCheckboxLabel = document.createElement('label');
                partCheckboxLabel.className = 'part-checkbox-label';
                var partCheckbox = document.createElement('input');
                partCheckbox.type = 'checkbox';
                partCheckbox.className = 'part-checkbox';
                partCheckbox.style.display = 'none';
                partCheckbox.name = 'part[id][]';
                partCheckbox.value = productId;
                if (qtys == 0) {
                    jQuery(partCheckbox).attr('disabled', 'disabled');
                }
                partCheckboxLabel.appendChild(partCheckbox);

                var partButton = document.createElement('input');
                partButton.type = 'button';
                partButton.className = 'part-button';
                partButton.name = 'part[button][]';
                partButton.value = 'Add';
                if (qtys <= 0) {
                    jQuery(partButton).attr('disabled', 'disabled');
                }
                partButton.onclick = function (e) {
                    var $checkbox = jQuery(this).parent().find('.part-checkbox');
                    $checkbox.prop('checked', true);
                    add($checkbox);
                };
                partCheckboxLabel.appendChild(partButton);

                partAddToCart.appendChild(partCheckboxLabel);

                partResult.appendChild(partAddToCart);

                $items.append(partResult);
            }

        }

        //scroll width
        var itemWidth = $items.find('.part-result:eq(0)').outerWidth();
        var itemsWidth = itemWidth * _items;
        $items.css('width', itemsWidth + 'px');

        var $nexts = jQuery('.next');

        //scroll results
        if (_items > _displayItems && jQuery('.next').length == 0) {

            var $message = jQuery(_addtocartForm).find('.message');
            $message.append('<a href="#" class="next">Next &rsaquo;</a>');
            jQuery('.next').click(scroll);
        }

    };

    //add one to cart
    var add = function ($checkbox)
    {
        cartProgress(true);
        var productId = $checkbox.val();
        var qty = jQuery('#part_qty_' + productId).val();
        var item = {product_id: productId, qty: qty}
        var data = {count: 0, items: []};
        data.count = 1;
        data.items.push(item);

        post(data);
    };

    //add to cart
    var addtocart = function (e)
    {
        if (!_addingtocart) {

            var $addtocartButton = jQuery(this);
            $addtocartButton.attr('disabled', 'disabled');
            _addingtocart = true;

            var data = {count: 0, items: []};

            jQuery('.part-checkbox:checked').each(function () {

                if (!jQuery(this).hasClass('part-added')) {

                    var productId = jQuery(this).val();
                    var qty = jQuery('#part_qty_' + productId).val();

                    var item = {product_id: productId, qty: qty}

                    data.items.push(item);
                    data.count++;
                }

            });

            if (data.count > 0) {

                post(data);
            }

        }

    };

    //post items to cart
    var post = function (data)
    {
        jQuery.post(_addtocartUrl, data, function (res) {

            if (!res.error) {

                //show checkout button and cart count
                var count = res.data.count;
                if (count > 0) {
                    jQuery(_checkoutButton).find('span span').html('Checkout (' + count + ')');
                    jQuery(_checkoutButton).show();
                } else {
                    jQuery(_checkoutButton).hide();
                }

                //replace cart header
                var topCartHtml = res.data.top_cart_html;
                jQuery('.top-cart').replaceWith(topCartHtml);

                //clear out results
                //reset();

                //flag added parts
                jQuery('.part-checkbox').addClass('part-added');

                //update cart
                updateCart();

            } else {

            }

            jQuery(_addtocartProgress).hide();
            _addingtocart = false;
        });

    };

    //update cart
    var updateCart = function ()
    {
        var $cartForm = jQuery(_cartForm);
        var $cartLoad = $cartForm.find('.part-cart-load');
        cartProgress(true);

        if ($cartLoad.length > 0) {
            $cartLoad.load(_cartUrl, function (response, status, xhr) {
                if (status == 'success') {

                    jQuery('.part-cart-remove').click(function (e) {

                        e.preventDefault();

                        var itemId = jQuery(this).attr('item_id');
                        itemId = parseInt(itemId);

                        if (!isNaN(itemId)) {

                            removeCart(itemId);

                        }

                    });

                    cartProgress(false);

                }

            });

        }

    };

    var cartProgress = function (show)
    {
        var $cartForm = jQuery(_cartForm);
        var $cartLoad = $cartForm.find('.part-cart-load');
        var outerHeight = $cartLoad.outerHeight();
        var $cartProgress = jQuery(_cartProgress);

        $cartProgress.css('height', outerHeight + 'px');
        var $addtocartProgress = jQuery(_addtocartProgress);

        if (show) {
            $cartProgress.show();
            $addtocartProgress.show();
        } else {
            $cartProgress.hide();
            $addtocartProgress.hide();
        }

    };

    //remove from cart
    var removeCart = function (itemId)
    {
        var data = {item_id: itemId};
        cartProgress(true);

        jQuery.post(_removeItemUrl, data, function (res) {

            if (!res.error) {

                var topCartHtml = res.data.top_cart_html;
                jQuery('.top-cart').replaceWith(topCartHtml);
                updateCart();

            } else {

            }
        });
    };

    return {
        init: function (options)
        {
            //set vars
            _searchUrl = options.searchUrl;
            _addtocartUrl = options.addtocartUrl;
            _cartUrl = options.cartUrl;
            _removeItemUrl = options.removeItemUrl;
            _searchForm = options.searchForm;
            _addtocartForm = options.addtocartForm;
            _cartForm = options.cartForm;
            _searchProgress = options.searchProgress;
            _addtocartProgress = options.addtocartProgress;
            _cartProgress = options.cartProgress;
            _partsearchButton = options.partsearchButton;
            _checkoutButton = options.checkoutButton;

            jQuery(function () {

                updateCart();
            });

        },
        search: function ()
        {
            search();
        }
    };
}();




