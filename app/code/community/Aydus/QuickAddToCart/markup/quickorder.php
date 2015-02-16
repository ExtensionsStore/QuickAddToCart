<div id="quickaddtocart">

	<div class="page-title title-buttons">
		<h1>Quick Order Form (Dealers)</h1>
	</div>

	<form id="quickaddtocart_search">

		<div class="quickaddtocart-search">
		
			<ol class="quickaddtocart-search-text">
				<li>Type any portion of the quickaddtocart number (i.e., 5054 or 0008)</li>
				<li>Enter the quantity</li>
				<li>Click the Add button</li>
				<li>Repeat process to add more quickaddtocarts</li>
				<li>Click check out in the bottom right hand corner of the cart summary</li>
			</ol>
		
			<div class="quickaddtocart-search-input">
				<input type="text" id="quickaddtocart" name="q" value="{{block type="quickaddtocart/quickaddtocart" output="getQuery" }}" class="input-text" maxlength="128" autocomplete="off" />
				<img src="{{skin url="images/quickaddtocart-progress.gif"}}" class="progress search-progress" />
				<button class="button quickaddtocartsearch-button">
					<span><span>Search</span></span>
				</button>
			</div>
	
			<div id="quickaddtocart_autocomplete"></div>		
		</div>

	</form>
	
	<div class="quickaddtocart-border"></div>

	<form id="quickaddtocart_form">
		<div class="page-title title-buttons">
			<h3>Search Results</h3>
			<div class="message"></div>
		</div>
				
		<div class="quickaddtocart-results">
					
			<div class="quickaddtocart-results-items">
				<ul class="items"></ul>
			</div>
			
			<div class="clear"></div>

		</div>
				
	</form>
	
	<div class="quickaddtocart-border"></div>
	
	<form id="quickaddtocart_cart">
		<div class="page-title title-buttons">
			<h3>Cart Summary</h3>
		</div>

		<div class="quickaddtocart-cart">
			<div class="quickaddtocart-cart-loading">
			    <span class="quickaddtocart-cart-progress"></span>
				<img src="{{skin url="images/quickaddtocart-progress.gif"}}" class="cart-progress" />
			</div>
			<div class="quickaddtocart-cart-load">
		
			</div>
		</div>
	</form>
	
</div>

<script type="application/javascript">
//<![CDATA[
    //auto complete
    //var searchForm = new Varien.searchForm('quickaddtocart_search', 'quickaddtocart', 'Enter quickaddtocart number');
    //searchForm.initAutocomplete('{{store url="catalogsearch/ajax/suggest"}}', 'quickaddtocart_autocomplete');
    
    var options = {
		searchUrl : '{{store url="quickaddtocart/index/search"}}',
		addtocartUrl : '{{store url="quickaddtocart/index/addtocart"}}',
		cartUrl : '{{store url="quickaddtocart/index/cart"}}',
		removeItemUrl : '{{store url="quickaddtocart/index/removeitem"}}',
		searchForm : '#quickaddtocart_search',
		addtocartForm : '#quickaddtocart_form',
		cartForm : '#quickaddtocart_cart',
		searchProgress : '.search-progress',
		cartProgress : '.quickaddtocart-cart-loading',
		quickaddtocartsearchButton : '.quickaddtocartsearch-button',
		checkoutButton : '.checkout-button'
   	};
    quickaddtocart.init(options);

    //prevent form submit, start ajax search
    new Event.observe('quickaddtocart_search', 'submit', function(e){
        e.stop();
        quickaddtocart.search();
    });

    //prevent form submit, add to cart is via ajax
    new Event.observe('quickaddtocart_form', 'submit', function(e){
        e.stop();
    });      
//]]>
</script>
