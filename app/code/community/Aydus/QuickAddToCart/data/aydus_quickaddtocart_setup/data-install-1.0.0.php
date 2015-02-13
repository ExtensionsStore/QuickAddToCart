<?php

/**
 * Install cms block
 * 
 * @category    Aydus
 * @package     Aydus_QuickAddToCart
 * @author     	Aydus Consulting <davidt@aydus.com>
 */
$installer = $this;
$installer->startSetup();
echo 'QuickAddToCart setup started ...<br/>';

$data = array(
    'title' => 'Quick Add To Cart',
    'identifier' => 'quickaddtocart',
    'content' => '<div id="quickaddtocart">

	<div class="page-title title-buttons">
		<h1>Quick Add To Cart</h1>
	</div>

	<form id="part_search">

		<div class="part-search">
		
			<div class="part-search-input">
				<input type="text" id="part" name="q" value="{{block type="quickaddtocart/quickaddtocart" output="getQuery" }}" class="input-text" maxlength="128" autocomplete="off" />
				<img src="{{skin url="images/aydus/quickaddtocart-progress.gif"}}" class="progress search-progress" />
				<button class="button partsearch-button">
					<span><span>Search</span></span>
				</button>
			</div>
	
			<div id="part_autocomplete"></div>		
		</div>

	</form>
	
	<div class="part-border"></div>

	<form id="part_form">
		<div class="page-title title-buttons">
			<h3>Search Results</h3>
			<div class="message"></div>
		</div>
				
		<div class="part-results">
					
			<div class="part-results-items">
				<ul class="items"></ul>
			</div>
			
			<div class="clear"></div>

		</div>
				
	</form>
	
	<div class="part-border"></div>
	
	<form id="part_cart">
		<div class="page-title title-buttons">
			<h3>Cart Summary</h3>
		</div>

		<div class="part-cart">
			<div class="part-cart-loading">
			    <span class="part-cart-progress"></span>
				<img src="{{skin url="images/aydus/quickaddtocart-progress.gif"}}" class="cart-progress" />
			</div>
			<div class="part-cart-load">
		
			</div>
		</div>
	</form>
	
</div>

<script type="application/javascript">
//<![CDATA[
    //auto complete
    //var searchForm = new Varien.searchForm("part_search", "part", "Enter part number");
    //searchForm.initAutocomplete("{{store url="catalogsearch/ajax/suggest"}}", "part_autocomplete");
    
    var options = {
		searchUrl : "{{store url="quickaddtocart/index/search"}}",
		addtocartUrl : "{{store url="quickaddtocart/index/addtocart"}}",
		cartUrl : "{{store url="quickaddtocart/index/cart"}}",
		removeItemUrl : "{{store url="quickaddtocart/index/removeitem"}}",
		searchForm : "#part_search",
		addtocartForm : "#part_form",
		cartForm : "#part_cart",
		searchProgress : ".search-progress",
		cartProgress : ".part-cart-loading",
		partsearchButton : ".partsearch-button",
		checkoutButton : ".checkout-button"
   	};
    quickaddtocart.init(options);

    //prevent form submit, start ajax search
    new Event.observe("part_search", "submit", function(e){
        e.stop();
        quickaddtocart.search();
    });

    //prevent form submit, add to cart is via ajax
    new Event.observe("part_form", "submit", function(e){
        e.stop();
    });      
//]]>
</script>',
    'is_active' => 1,
    'stores' => 0
);

$block = Mage::getModel('cms/block')->load('quickaddtocart','identifier');

if (!$block->getId()) {
    
    $block->setData($data)->save();
}

echo 'QuickAddToCart setup complete.';
$installer->endSetup();