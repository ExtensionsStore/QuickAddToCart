/**
 * QuickAddToCart js
 *
 * @category    Aydus
 * @package     Aydus_QuickAddToCart
 * @author     	Aydus Consulting <davidt@aydus.com>
 */

var quickaddtocart = function ($)
{
    //quickaddtocart controller
    var _controllerUrl;

    //forms
    var _searchForm;
    var _addtocartForm;
    var _cartForm;

    //buttons
    var _quickaddtocartsearchButton
    var _checkoutButton;

    //progress selectors
    var _searchProgress;
    var _cartProgress;

    //locks
    var _searching = false;
    var _addingtocart = false;

    //perform search
    var search = function (url)
    {
        if (!_searching) {

            jQuery(_searchProgress).css('display', 'inline-block');
            jQuery(_quickaddtocartsearchButton).attr('disabled', 'disabled');
            _searching = true;
            var $message = jQuery(_addtocartForm).find('.message');
            $message.html('');

            var data = jQuery(_searchForm).serialize(true);
            var q = jQuery('#quickaddtocart-query').val();
            
            if (!url){
            	
            	url = _controllerUrl + 'search?q=' + encodeURIComponent(q);
            }

            jQuery.post(url, data, function (res) {

                jQuery(_addtocartForm).show();
                jQuery('.quickaddtocart-results-items').html(res.data);
                jQuery('.quickaddtocart-results').show();

                if (res.count > 0) {
                    initResultHandlers(res);
                } 

                jQuery(_searchProgress).hide();
                jQuery(_quickaddtocartsearchButton).removeAttr('disabled');
                _searching = false;

            });
        }
    };
    
    //remove inline handlers and handle
    var initResultHandlers = function(res)
    {
    	//toolbar
    	jQuery('.toolbar select').prop('onchange',null).change(navigation);
    	jQuery('.toolbar a').click(navigation);
    	
    	//layer
    	jQuery('.block-layered-nav a').click(navigation);
    	
    	//products list
    	jQuery('.category-products .btn-cart').prop('onclick',null).click(addToCart);
    	jQuery('.category-products .link-wishlist').click(addToWishlist);
    	jQuery('.category-products .link-compare').click(addToCompare);
    	//configurable
    	var addToCartText = res.translate['Add to Cart'];
    	jQuery('.category-products .actions, .category-products .action').find('a.button').attr('title',addToCartText).text(addToCartText).click(addToCart);
        
    	//from app.js
    	if (enquire){
    		
            enquire.register('(max-width: ' + bp.medium + 'px)', {
                setup: function () {
                    this.toggleElements = $j(
                        // This selects the menu on the My Account and CMS pages
                        '.col-left-first .block:not(.block-layered-nav) .block-title, ' +
                            '.col-left-first .block-layered-nav .block-subtitle--filter, ' +
                            '.sidebar:not(.col-left-first) .block .block-title'
                    );
                },
                match: function () {
                    this.toggleElements.toggleSingle();
                },
                unmatch: function () {
                    this.toggleElements.toggleSingle({destruct: true});
                }
            });
            
            $j('.toggle-content').each(function () {
                var wrapper = jQuery(this);

                var hasTabs = wrapper.hasClass('tabs');
                var hasAccordion = wrapper.hasClass('accordion');
                var startOpen = wrapper.hasClass('open');

                var dl = wrapper.children('dl:first');
                var dts = dl.children('dt');
                var panes = dl.children('dd');
                var groups = new Array(dts, panes);

                //Create a ul for tabs if necessary.
                if (hasTabs) {
                    var ul = jQuery('<ul class="toggle-tabs"></ul>');
                    dts.each(function () {
                        var dt = jQuery(this);
                        var li = jQuery('<li></li>');
                        li.html(dt.html());
                        ul.append(li);
                    });
                    ul.insertBefore(dl);
                    var lis = ul.children();
                    groups.push(lis);
                }

                //Add "last" classes.
                var i;
                for (i = 0; i < groups.length; i++) {
                    groups[i].filter(':last').addClass('last');
                }

                function toggleClasses(clickedItem, group) {
                    var index = group.index(clickedItem);
                    var i;
                    for (i = 0; i < groups.length; i++) {
                        groups[i].removeClass('current');
                        groups[i].eq(index).addClass('current');
                    }
                }

                //Toggle on tab (dt) click.
                dts.on('click', function (e) {
                    //They clicked the current dt to close it. Restore the wrapper to unclicked state.
                    if (jQuery(this).hasClass('current') && wrapper.hasClass('accordion-open')) {
                        wrapper.removeClass('accordion-open');
                    } else {
                        //They're clicking something new. Reflect the explicit user interaction.
                        wrapper.addClass('accordion-open');
                    }
                    toggleClasses(jQuery(this), dts);
                });

                //Toggle on tab (li) click.
                if (hasTabs) {
                    lis.on('click', function (e) {
                        toggleClasses(jQuery(this), lis);
                    });
                    //Open the first tab.
                    lis.eq(0).trigger('click');
                }

                //Open the first accordion if desired.
                if (startOpen) {
                    dts.eq(0).trigger('click');
                }

            });       		
    	}
     
    };
    
    //handle navigation selection
    var navigation = function(e)
    {
    	e.preventDefault();
    	e.stopPropagation();
     	e.stopImmediatePropagation();
    	
    	var $toolbarEle = jQuery(this);
    	
    	var elementType = $toolbarEle.prop('tagName');
    	var location;
    	
    	if (elementType == 'SELECT'){
    		
    		location = $toolbarEle.val();
    		
    	} else if (elementType == 'A') {
    		
    		location = $toolbarEle.attr('href');
    	}
    	
    	if (location){
    		search(location);
    	}
    	
    };

    //init remove and qty
    var initCartHandlers = function()
    {
        jQuery('.cart input.qty').change(editQty);
        jQuery('.btn-remove').click(removeCart);
    };
    
    //add to wishlist
    var addToWishlist = function(e)
    {
    	e.preventDefault();
    	e.stopPropagation();
     	e.stopImmediatePropagation();
    	
    };
    
    //add to compare
    var addToCompare = function(e)
    {
    	e.preventDefault();
    	e.stopPropagation();
     	e.stopImmediatePropagation();
    	
    };    

    //add one to cart
    var addToCart = function (e)
    {
    	e.preventDefault();
    	e.stopPropagation();
     	e.stopImmediatePropagation();

        cartProgress(true);
        
    	var elementType = jQuery(this).prop('tagName');
    	var location;
    	
    	//add to cart button
    	if (elementType == 'BUTTON'){
    		
    		location = this.getAttribute('onclick');
    		
    	} else if (elementType == 'A') { //configurable link
    		
    		//get product id
    		var $productInfo = jQuery(this).parents('.product-info');
    		location = $productInfo.find('.link-wishlist').attr('href');
    	}
    	
    	if (location){
    		
            var productId = location.replace(/^(.+)\/product\/(\d+)\/form_key\/(.+)$/,'$2');
            var qty = 1;
            var item = {product_id: productId, qty: qty}
            var data = {count: 0, items: []};
            data.count = 1;
            data.items.push(item);

            post(data);
    	}        

    };

    //post items to cart
    var post = function (data)
    {
        jQuery.post(_controllerUrl + 'addtocart', data, function (res) {

            if (!res.error) {

            	updateHeaderCart(res.data);

                //flag added quickaddtocarts
                jQuery('.quickaddtocart-checkbox').addClass('quickaddtocart-added');

                //update cart
                updateCart();
            } 

            cartProgress(false);
            jQuery(_addtocartProgress).hide();
            _addingtocart = false;
        });

    };
    
    var updateHeaderCart = function(data)
    {
    	for (var selector in data){
    		
    		var datum = data[selector];
    		
    		if (datum.html){
        		var html = datum.html;
        		jQuery(selector).html(html);
    		}
    		if (datum.attributes){
    			for (var attributeKey in datum.attributes){
    				var attributeValue = datum.attributes[attributeKey];
        			jQuery(selector).attr(attributeKey, attributeValue);
    			}
    		}
    		if (datum.hide){
    			jQuery(selector).hide();
    		}
    		if (datum.addClass && datum.addClass.length > 0){
    			jQuery(selector).addClass(datum.addClass);
    		}
    		if (datum.removeClass && datum.removeClass.length > 0){
    			jQuery(selector).removeClass(datum.removeClass);
    		}
    	}
    };

    //update cart
    var updateCart = function ()
    {
        var $cartForm = jQuery(_cartForm);
        var $cartLoad = $cartForm.find('.quickaddtocart-cart-load');
        cartProgress(true);

        if ($cartLoad.length > 0) {
            $cartLoad.load(_controllerUrl + 'cart', function (response, status, xhr) {
                if (status == 'success') {

                	initCartHandlers();
                    cartProgress(false);

                }

            });

        }

    };

    var cartProgress = function (show)
    {
        var $cartForm = jQuery(_cartForm);
        var $cartLoad = $cartForm.find('.quickaddtocart-cart-load');
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
    
    //edit item qty
    var editQty = function(e){
    	
        e.preventDefault();
        var $input = jQuery(this);
        var name = $input.attr('name');
        var itemId = name.replace(/cart\[(\d+)\]\[qty\]/,'$1');
        itemId = parseInt(itemId);
        var qty = $input.val();
        qty = parseInt(qty);

        if (!isNaN(itemId) && !isNaN(qty)) {

            var data = {item_id: itemId, qty: qty};
            cartProgress(true);

            jQuery.post(_controllerUrl + 'editqty', data, function (res) {

                if (!res.error) {

                	updateHeaderCart(res.data);

                    updateCart();

                } else {

                }
            });

        }       	
    };

    //remove from cart
    var removeCart = function (e)
    {
        e.preventDefault();
        var href = jQuery(this).attr('href');
        var itemId = href.replace(/^(.+)\/id\/(\d+)\/uenc.+$/,'$2');
        itemId = parseInt(itemId);

        if (!isNaN(itemId)) {

            var data = {item_id: itemId};
            cartProgress(true);

            jQuery.post(_controllerUrl + 'removeitem', data, function (res) {

                if (!res.error) {

                	updateHeaderCart(res.data);

                    updateCart();

                } else {

                }
            });

        }    	

    };

    return {
        init: function (options)
        {
            //set vars
            _controllerUrl = options.controllerUrl;
            _addtocartForm = options.addtocartForm;
            _cartForm = options.cartForm;
            _searchForm = options.searchForm;
            _searchProgress = options.searchProgress;
            _addtocartProgress = options.addtocartProgress;
            _cartProgress = options.cartProgress;
            _quickaddtocartsearchButton = options.quickaddtocartsearchButton;
            _checkoutButton = options.checkoutButton;
            
            initCartHandlers();            

        },
        search: function ()
        {
            search();
        }
    };
}();




