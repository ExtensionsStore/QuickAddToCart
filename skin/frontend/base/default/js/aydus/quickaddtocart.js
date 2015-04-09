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

    //progress
    var _progressBackground;

    //lock
    var _searching = false;

    //perform search
    var search = function (url)
    {
        if (!_searching) {

            progress('#quickaddtocart-query', true, '98% center');
            $('.quickaddtocart-search-button').attr('disabled', 'disabled');
            _searching = true;
            var $message = $('#quickaddtocart_form').find('.message');
            $message.html('');

            var data = $('#quickaddtocart_search').serialize(true);
            var q = $('#quickaddtocart-query').val();
            
            if (!url){
            	
            	url = _controllerUrl + 'search?q=' + encodeURIComponent(q);
            }

            $.post(url, data, function (res) {

                $('#quickaddtocart_form').show();
                $('.quickaddtocart-results-items').html(res.data);
                $('.quickaddtocart-results').show();

                if (res.count > 0) {
                    initResultHandlers(res);
                } 

                progress('#quickaddtocart-query', false);
                $('.quickaddtocart-search-button').removeAttr('disabled');
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

    //@todo add to wishlist
    var addToWishlist = function(e)
    {
    	e.preventDefault();
    	e.stopPropagation();
     	e.stopImmediatePropagation();
     	
		var wishlistLink = $(this).attr('href');

    	$.get(wishlistLink);
    };
    
    //@todo add to compare
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
		$('#select-options').show();
		progress('.select-options-container', true);
		
        $.get(_controllerUrl + 'options', data, function(res){
        	
            if (!res.error) {
            	
        		progress('.select-options-container', false);
				$('.select-options-form').html(res.data);
            	$('.page').css('position','relative');

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

        progress('.quickaddtocart-cart', true);
        
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
            var data = {product: productId, qty: qty};

            $.post(_controllerUrl + 'addtocart', data, function (res) {

                if (!res.error) {

                	updateHeaderCart(res.data);

                    updateCart();
                } 

                progress('.quickaddtocart-cart', false);
                
            });

    	}        

    };
    
    //update the header cart
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
        var $cartForm = $('#quickaddtocart_cart');
        var $cartLoad = $cartForm.find('.quickaddtocart-cart-load');
        progress('.quickaddtocart-cart',true);

        if ($cartLoad.length > 0) {
            $cartLoad.load(_controllerUrl + 'cart', function (response, status, xhr) {
                if (status == 'success') {

                	initCartHandlers();
                    progress('.quickaddtocart-cart',false);

                }

            });

        }

    };
    
    //progress background
    var progress = function(selector, show, position)
    {
    	var $container = $(selector);
    	if (show){
    		        	
        	$container.attr('style', _progressBackground);   
        	
        	if (position){
        		
            	$container.css('background-position', position);   
        	}
        	
    	} else {
    		
        	$container.attr('style', '');    		
    		
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
            progress('.quickaddtocart-cart',true);

            $.post(_controllerUrl + 'editqty', data, function (res) {

                if (!res.error) {

                	updateHeaderCart(res.data);

                    updateCart();

                } else {

                }
                
                progress('.quickaddtocart-cart',false);
                
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
            progress('.quickaddtocart-cart',true);

            $.post(_controllerUrl + 'removeitem', data, function (res) {

                if (!res.error) {

                	updateHeaderCart(res.data);

                    updateCart();

                } else {

                }
                
                progress('.quickaddtocart-cart',false);
                
            });

        }    	

    };

    return {
        init: function (options)
        {
            //set vars
            _controllerUrl = options.controllerUrl;
            _progressBackground = options.progressBackground;
            
            initCartHandlers();
            
            $('.select-options-close').click(this.close);

        },
        search: function ()
        {
            search();
        },
        close : function(e)
        {
        	e.preventDefault();
        	$('#select-options').hide();
        },
        submit: function(varienForm)
        {
        	if (varienForm.validator.validate()){
        		
        		progress('.select-options-container', true);

                var form = varienForm.form;
                var data = $(form).serialize();
                
                $.post(_controllerUrl + 'addtocart', data, function (res) {

                    if (!res.error) {

                    	updateHeaderCart(res.data);

                        updateCart();
                    } 
            		progress('.select-options-container', false);
            		//remove options
                    $('.select-options-form').html();
                    $('.select-options-close').click();

                });        		
        	}
        }
    };
};

if (!window.jQuery){
	
	document.write('<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script><script>jQuery.noConflict(); var quickaddtocart = new QuickAddToCart(jQuery);</script>');
	
} else {
	
	var quickaddtocart = new QuickAddToCart(jQuery);
}


