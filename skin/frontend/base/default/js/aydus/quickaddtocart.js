/**
 * QuickAddToCart js
 *
 * @category    Aydus
 * @package     Aydus_QuickAddToCart
 * @author     	Aydus Consulting <davidt@aydus.com>
 */

function QuickAddToCart($)
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

            $(_searchProgress).css('display', 'inline-block');
            $(_quickaddtocartsearchButton).attr('disabled', 'disabled');
            _searching = true;
            var $message = $(_addtocartForm).find('.message');
            $message.html('');

            var data = $(_searchForm).serialize(true);
            var q = $('#quickaddtocart-query').val();
            
            if (!url){
            	
            	url = _controllerUrl + 'search?q=' + encodeURIComponent(q);
            }

            $.post(url, data, function (res) {

                $(_addtocartForm).show();
                $('.quickaddtocart-results-items').html(res.data);
                $('.quickaddtocart-results').show();

                if (res.count > 0) {
                    initResultHandlers(res);
                } 

                $(_searchProgress).hide();
                $(_quickaddtocartsearchButton).removeAttr('disabled');
                _searching = false;

            });
        }
    };
    
    //remove inline handlers and handle
    var initResultHandlers = function(res)
    {
    	//toolbar
    	$('.toolbar select').prop('onchange',null).change(navigation);
    	$('.toolbar a').click(navigation);
    	
    	//layer
    	$('.block-layered-nav a').click(navigation);
    	
    	//products list
    	$('.category-products .btn-cart').prop('onclick',null).click(addToCart);
    	
    	//@todo wishlist and compare
    	//$('.category-products .link-wishlist').click(addToWishlist);
    	//$('.category-products .link-compare').click(addToCompare);
    	
    	//configurable/bundle/required options
    	var addToCartText = res.translate['Add to Cart'];
    	$('.category-products .actions, .category-products .action').find('a.button').attr('title',addToCartText).text(addToCartText).click(selectOptions);
        
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
                var wrapper = $(this);

                var hasTabs = wrapper.hasClass('tabs');
                var hasAccordion = wrapper.hasClass('accordion');
                var startOpen = wrapper.hasClass('open');

                var dl = wrapper.children('dl:first');
                var dts = dl.children('dt');
                var panes = dl.children('dd');
                var groups = new Array(dts, panes);

                //Create a ul for tabs if necessary.
                if (hasTabs) {
                    var ul = $('<ul class="toggle-tabs"></ul>');
                    dts.each(function () {
                        var dt = $(this);
                        var li = $('<li></li>');
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
                    if ($(this).hasClass('current') && wrapper.hasClass('accordion-open')) {
                        wrapper.removeClass('accordion-open');
                    } else {
                        //They're clicking something new. Reflect the explicit user interaction.
                        wrapper.addClass('accordion-open');
                    }
                    toggleClasses($(this), dts);
                });

                //Toggle on tab (li) click.
                if (hasTabs) {
                    lis.on('click', function (e) {
                        toggleClasses($(this), lis);
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
    	
    	var $toolbarEle = $(this);
    	
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

    //add to wishlist
    var addToWishlist = function(e)
    {
    	e.preventDefault();
    	e.stopPropagation();
     	e.stopImmediatePropagation();
     	
		var wishlistLink = $(this).attr('href');

    	$.get(wishlistLink);
    };
    
    //add to compare
    var addToCompare = function(e)
    {
    	e.preventDefault();
    	e.stopPropagation();
     	e.stopImmediatePropagation();
     	
		var compareLink = $(this).attr('href');

    	$.get(compareLink);
    };    

    //init remove and qty
    var initCartHandlers = function()
    {
        $('.cart input.qty').change(editQty);
        $('.btn-remove').click(removeCart);
    };   
    
    //configurable/bundle options
    var selectOptions = function(e)
    {
    	e.preventDefault();
    	e.stopPropagation();
     	e.stopImmediatePropagation();
     	
		var $productInfo = $(this).parents('.product-info');
		var location = $productInfo.find('.link-wishlist').attr('href');
		
        var productId = _getProductId(location);
        var data = {product_id:productId};
		
        $.get(_controllerUrl + 'options', data, function(res){
        	
            if (!res.error) {
            	
				$('.select-options-form').html(res.data);
				
				
				
            	$('.page').css('position','relative');
				$('#select-options').show();

            } else {

            	//console.log(res.data);
            }        	
        	
        });
     	
    }
    
    // parse out product id from link
    var _getProductId = function(url)
    {
    	var productId = url.replace(/^(.+)\/product\/(\d+)\/form_key\/(.+)$/,'$2');
    	
    	return productId;
    };
    
    //add one to cart
    var addToCart = function (e)
    {
    	e.preventDefault();
    	e.stopPropagation();
     	e.stopImmediatePropagation();

        cartProgress(true);
        
    	var elementType = $(this).prop('tagName');
    	var location;
    	
    	//add to cart button
    	if (elementType == 'BUTTON'){
    		
    		location = this.getAttribute('onclick');
    		
    	} else if (elementType == 'A') { //configurable link
    		
    		//get product id
    		var $productInfo = $(this).parents('.product-info');
    		location = $productInfo.find('.link-wishlist').attr('href');
    	}
    	
    	if (location){
    		
            var productId = _getProductId(location);
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
        $.post(_controllerUrl + 'addtocart', data, function (res) {

            if (!res.error) {

            	updateHeaderCart(res.data);

                //flag added quickaddtocarts
                $('.quickaddtocart-checkbox').addClass('quickaddtocart-added');

                //update cart
                updateCart();
            } 

            cartProgress(false);
            $(_addtocartProgress).hide();
            _addingtocart = false;
        });

    };
    
    var updateHeaderCart = function(data)
    {
    	for (var selector in data){
    		
    		var datum = data[selector];
    		
    		if (datum.html){
        		var html = datum.html;
        		$(selector).html(html);
    		}
    		if (datum.attributes){
    			for (var attributeKey in datum.attributes){
    				var attributeValue = datum.attributes[attributeKey];
        			$(selector).attr(attributeKey, attributeValue);
    			}
    		}
    		if (datum.hide){
    			$(selector).hide();
    		}
    		if (datum.addClass && datum.addClass.length > 0){
    			$(selector).addClass(datum.addClass);
    		}
    		if (datum.removeClass && datum.removeClass.length > 0){
    			$(selector).removeClass(datum.removeClass);
    		}
    	}
    };

    //update cart
    var updateCart = function ()
    {
        var $cartForm = $(_cartForm);
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
        var $cartForm = $(_cartForm);
        var $cartLoad = $cartForm.find('.quickaddtocart-cart-load');
        var outerHeight = $cartLoad.outerHeight();
        var $cartProgress = $(_cartProgress);

        $cartProgress.css('height', outerHeight + 'px');
        var $addtocartProgress = $(_addtocartProgress);

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
        var $input = $(this);
        var name = $input.attr('name');
        var itemId = name.replace(/cart\[(\d+)\]\[qty\]/,'$1');
        itemId = parseInt(itemId);
        var qty = $input.val();
        qty = parseInt(qty);

        if (!isNaN(itemId) && !isNaN(qty)) {

            var data = {item_id: itemId, qty: qty};
            cartProgress(true);

            $.post(_controllerUrl + 'editqty', data, function (res) {

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
        var href = $(this).attr('href');
        var itemId = href.replace(/^(.+)\/id\/(\d+)\/uenc.+$/,'$2');
        itemId = parseInt(itemId);

        if (!isNaN(itemId)) {

            var data = {item_id: itemId};
            cartProgress(true);

            $.post(_controllerUrl + 'removeitem', data, function (res) {

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
        },
        submit: function(varienForm)
        {
        	if (varienForm.validator.validate()){
        		
                cartProgress(true);
                var form = varienForm.form;
                var data = $(form).serialize();
                
                $.post(_controllerUrl + 'addtocart', data, function (res) {

                    if (!res.error) {

                    	updateHeaderCart(res.data);

                        //flag added quickaddtocarts
                        $('.quickaddtocart-checkbox').addClass('quickaddtocart-added');

                        //update cart
                        updateCart();
                    } 

                    cartProgress(false);
                    $(_addtocartProgress).hide();
                    _addingtocart = false;
                });        		
        	}
        }
    };
};

if (!window.jQuery){
	
	document.write('<script src="//ajax.googleapis.com/ajax/libs/$/1.11.2/$.min.js">\x3C/script><script>$.noConflict(); var quickaddtocart = new QuickAddToCart(jQuery);</script>');
	
} else {
	
	var quickaddtocart = new QuickAddToCart(jQuery);
}


