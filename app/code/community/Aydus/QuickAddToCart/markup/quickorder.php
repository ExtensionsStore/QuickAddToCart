<div id="quickaddtocart">

	<div class="page-title title-buttons">
		<h1>Quick Order Form (Dealers)</h1>
	</div>

	<form id="part_search">

		<div class="part-search">
		
			<ol class="part-search-text">
				<li>Type any portion of the part number (i.e., 5054 or 0008)</li>
				<li>Enter the quantity</li>
				<li>Click the Add button</li>
				<li>Repeat process to add more parts</li>
				<li>Click check out in the bottom right hand corner of the cart summary</li>
			</ol>
		
			<div class="part-search-input">
				<input type="text" id="part" name="q" value="{{block type="quickaddtocart/quickaddtocart" output="getQuery" }}" class="input-text" maxlength="128" autocomplete="off" />
				<img src="{{skin url="images/quickaddtocart-progress.gif"}}" class="progress search-progress" />
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
				<img src="{{skin url="images/quickaddtocart-progress.gif"}}" class="cart-progress" />
			</div>
			<div class="part-cart-load">
		
			</div>
		</div>
	</form>
	
</div>

<script type="application/javascript">
//<![CDATA[
    //auto complete
    //var searchForm = new Varien.searchForm('part_search', 'part', 'Enter part number');
    //searchForm.initAutocomplete('{{store url="catalogsearch/ajax/suggest"}}', 'part_autocomplete');
    
    var options = {
		searchUrl : '{{store url="quickaddtocart/index/search"}}',
		addtocartUrl : '{{store url="quickaddtocart/index/addtocart"}}',
		cartUrl : '{{store url="quickaddtocart/index/cart"}}',
		removeItemUrl : '{{store url="quickaddtocart/index/removeitem"}}',
		searchForm : '#part_search',
		addtocartForm : '#part_form',
		cartForm : '#part_cart',
		searchProgress : '.search-progress',
		cartProgress : '.part-cart-loading',
		partsearchButton : '.partsearch-button',
		checkoutButton : '.checkout-button'
   	};
    quickaddtocart.init(options);

    //prevent form submit, start ajax search
    new Event.observe('part_search', 'submit', function(e){
        e.stop();
        quickaddtocart.search();
    });

    //prevent form submit, add to cart is via ajax
    new Event.observe('part_form', 'submit', function(e){
        e.stop();
    });      
//]]>
</script>
