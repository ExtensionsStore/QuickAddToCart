<?php

/**
 * Quick Add To Cart controller
 *
 * @category    Aydus
 * @package     Aydus_QuickAddToCart
 * @author     	Aydus Consulting <davidt@aydus.com>
 */
class Aydus_QuickAddToCart_IndexController extends Mage_Core_Controller_Front_Action {

    /**
     * Display quickaddtocart directory
     */
    public function indexAction() {
        $this->loadLayout();
        $this->renderLayout();
    }

    /**
     * Display quickaddtocart directory
     */
    public function customerAction() {
        $this->loadLayout();
        $this->renderLayout();

        // 		if (Mage::helper('customer')->isLoggedIn()){
        // 			$customer = Mage::helper('customer')->getCustomer();
        // 			$dealerHelper = Mage::helper('dealer');
        // 			if ($dealerHelper->isDealer($customer)){
        // 				$this->loadLayout();
        // 				$this->renderLayout();
        // 			} else {
        // 				$this->_redirect("/");
        // 			}
        // 		} else {
        // 			$this->_redirect("/");
        // 		}
    }

    /**
     * Get search results
     */
    public function searchAction() {
        $p = ((int) $this->getRequest()->getParam('p')) ? (int) $this->getRequest()->getParam('p') : 1;
        $limit = ((int) $this->getRequest()->getParam('limit')) ? (int) $this->getRequest()->getParam('limit') : 9;
        $query = Mage::helper('catalogsearch')->getQuery();
        $query->prepare();

        $items = array();
        $count = 0;

        if ($query->getQueryText()) {

            $q = $query->getQueryText();
            $cache = Mage::app()->getCache();
            $itemsKey = md5(get_class($this) . '_' . $q . '_' . $p . '_' . $limit);
            $items = unserialize($cache->load($itemsKey));
            $countKey = md5(get_class($this) . '_' . $q);
            $count = unserialize($cache->load($countKey));

            if (!$items) {

                $fulltextModel = Mage::getModel('catalogsearch/fulltext');
                $fulltextResource = Mage::getResourceModel('catalogsearch/fulltext');
                $fulltextResource->prepareResult($fulltextModel, $q, $query);

                $collection = Mage::getResourceModel('catalog/product_collection');
                $searchResultTable = $collection->getTable('catalogsearch/result');
                $select = $collection->getSelect();
                $select->joinInner(
                        array('search_result' => $searchResultTable), $collection->getConnection()->quoteInto('search_result.product_id = e.entity_id AND search_result.query_id = ?', $query->getId()), array('relevance' => 'relevance')
                );

                if ($collection->getSize() > 0) {

                    $collection->setPageSize($limit);
                    $collection->setCurPage($p);

                    $count = $collection->getSize();
                    $helper = Mage::helper('core');

                    foreach ($collection as $product) {

                        $product->load($product->getId());

                        $productData = array(
                            "id" => $product->getId(),
                            "name" => $product->getName(),
                            "description" => $product->getShortDescription(),
                            "url" => $product->getProductUrl(),
                            "sku" => $product->getSku(),
                            "final_price" => $helper->formatPrice($product->getFinalPrice(), false) . ' ' . $currencyCode,
                            "price" => $helper->formatPrice($product->getInitialPrice(), false) . ' ' . $currencyCode,
                            "image" => Mage::helper('catalog/image')->init($product, 'small_image')->resize(166)->__toString(),
                        );

                        $items[] = $productData;
                    }

                    $cache->save(serialize($count), $countKey, array(), 604800);
                    $cache->save(serialize($items), $itemsKey, array(), 604800);
                }
            }

            if (!Mage::helper('catalogsearch')->isMinQueryLength()) {
                $query->save();
            }
        }

        $searchResultsObj = new StdClass();
        $searchResultsObj->count = $count;
        $searchResultsObj->items = $items;
        $searchResultsJson = json_encode($searchResultsObj);

        $this->getResponse()->setHeader('Content-type', 'application/json')->setBody($searchResultsJson);
    }

    /**
     * Add to cart
     */
    public function addtocartAction() {
        $count = (int) $this->getRequest()->getParam('count');
        $items = $this->getRequest()->getParam('items');
        $result = array();

        if ($count && $count == count($items)) {

            try {
                $cart = Mage::getModel('checkout/cart');
                $cart->init();
                foreach ($items as $item) {
                    $productId = (int) $item['product_id'];
                    $qty = $item['qty'];
                    $product = Mage::getModel('catalog/product')->load($productId);
                    $cart->addProduct($product, array('qty' => $qty));
                }
                $cart->save();
                Mage::getSingleton('checkout/session')->setCartWasUpdated(true);

                $cartHeader = $this->_getCartHeader();
                $cartHeader->addItemRender('simple', 'checkout/cart_item_renderer', 'checkout/cart/sidebar/default.phtml');
                $cartHeader->addItemRender('grouped', 'checkout/cart_item_renderer_grouped', 'checkout/cart/sidebar/default.phtml');
                $cartHeader->addItemRender('configurable', 'checkout/cart_item_renderer_configurable', 'checkout/cart/sidebar/default.phtml');
                if (Mage::getSingleton('core/design_package')->getPackageName() == 'rwd'){
                    $cartHeader->setTemplate('checkout/cart/minicart/items.phtml');
                } else {
                    $cartHeader->setTemplate('checkout/cart/cartheader.phtml');
                }
                
                $count = $cart->getQuote()->getItemsQty();
                $removeClass = '';
                
                if ($count == 1) {
                    $topLinkCart = Mage::helper('checkout')->__('My Cart (%s item)', $count);
                    $removeClass = 'no-count';
                } elseif ($count > 0) {
                    $topLinkCart = Mage::helper('checkout')->__('My Cart (%s items)', $count);
                    $removeClass = 'no-count';
                } else {
                    $topLinkCart = Mage::helper('checkout')->__('My Cart');
                }

                $result['error'] = false;
                $result['data'] = array(
                            '.top-link-cart' => array(
                                'html' => $topLinkCart,
                            ),
                            '.skip-cart .count' => array(
                                'html' => $count,
                            ),
                            '.skip-cart' => array(
                                'removeClass' => $removeClass,
                            ),
                            '#header-cart' => array(
                                'html' => $cartHeader->toHtml(),
                            ),
                            '.top-cart' => array(
                                'html' => $cartHeader->toHtml(),
                            ),
                        );
                
            } catch (Exception $e) {

                $result['error'] = true;
                $result['data'] = $e->getMessage();
            }
        } else {

            $result['error'] = true;
            $result['data'] = 'Nothing to add';
        }

        $resultJson = json_encode($result);

        $this->getResponse()->setHeader('Content-type', 'application/json')->setBody($resultJson);
    }

    /**
     * Get cart header
     * 
     * @return Mage_Checkout_Block_Cart_Sidebar
     */
    protected function _getCartHeader() {
        
        $cartHeader = $this->getLayout()->createBlock('checkout/cart_sidebar');
        
        return $cartHeader;
    }

    /**
     * Get cart items
     */
    public function cartAction() {
        
        $cartHeader = $this->_getCartHeader();
        $cartHeader->addItemRender('simple', 'checkout/cart_item_renderer', 'checkout/cart/item/default.phtml');
        $cartHeader->addItemRender('grouped', 'checkout/cart_item_renderer_grouped', 'checkout/cart/item/default.phtml');
        $cartHeader->addItemRender('configurable', 'checkout/cart_item_renderer_configurable', 'checkout/cart/item/default.phtml');
        $cartHeader->setTemplate('aydus/quickaddtocart/cart.phtml');
        $cartHeader->setCartTemplate('aydus/quickaddtocart/cart.phtml');
        $cartHeader->setEmptyTemplate('aydus/quickaddtocart/cart.phtml');

        echo $cartHeader->toHtml();
    }
    
    /**
     * Edit item qty
     */
    public function editqtyAction(){
        
        $itemId = (int) $this->getRequest()->getParam('item_id');
        $qty = (int) $this->getRequest()->getParam('qty');
        $result = array();
        
        if ($itemId && is_numeric($qty)) {
        
            try {
                $cart = Mage::getModel('checkout/cart');
                $cart->init();
                $cart->updateItem($itemId, array('qty'=>$qty));
                $cart->save();
                Mage::getSingleton('checkout/session')->setCartWasUpdated(true);
        
                $cartHeader = $this->_getCartHeader();
                $cartHeader->addItemRender('simple', 'checkout/cart_item_renderer', 'checkout/cart/sidebar/default.phtml');
                $cartHeader->addItemRender('grouped', 'checkout/cart_item_renderer_grouped', 'checkout/cart/sidebar/default.phtml');
                $cartHeader->addItemRender('configurable', 'checkout/cart_item_renderer_configurable', 'checkout/cart/sidebar/default.phtml');
                if (Mage::getSingleton('core/design_package')->getPackageName() == 'rwd'){
                    $cartHeader->setTemplate('checkout/cart/minicart/items.phtml');
                } else {
                    $cartHeader->setTemplate('checkout/cart/cartheader.phtml');
                }
        
                $count = $cart->getQuote()->getItemsQty();
                $addClass = '';
        
                if ($count == 1) {
                    $topLinkCart = Mage::helper('checkout')->__('My Cart (%s item)', $count);
                } elseif ($count > 0) {
                    $topLinkCart = Mage::helper('checkout')->__('My Cart (%s items)', $count);
                } else {
                    $topLinkCart = Mage::helper('checkout')->__('My Cart');
                    $addClass = 'no-count';
                }
        
                $result['error'] = false;
                $result['data'] = array(
                        '.top-link-cart' => array(
                                'html' => $topLinkCart,
                        ),
                        '.skip-cart .count' => array(
                                'html' => $count,
                        ),
                        '.skip-cart' => array(
                                'addClass' => $addClass,
                        ),
                        '#header-cart' => array(
                                'html' => $cartHeader->toHtml(),
                        ),
                        '.top-cart' => array(
                                'html' => $cartHeader->toHtml(),
                        ),
                );
        
            } catch (Exception $e) {
        
                $result['error'] = true;
                $result['data'] = $e->getMessage();
            }
        } else {
        
            $result['error'] = true;
            $result['data'] = 'No item';
        }
        
        $resultJson = json_encode($result);
        
        $this->getResponse()->setHeader('Content-type', 'application/json')->setBody($resultJson);        
    }

    /**
     * Remove item from cart
     */
    public function removeitemAction() {
        $itemId = (int) $this->getRequest()->getParam('item_id');
        $result = array();

        if ($itemId) {

            try {
                $cart = Mage::getModel('checkout/cart');
                $cart->init();
                $cart->removeItem($itemId);
                $cart->save();
                Mage::getSingleton('checkout/session')->setCartWasUpdated(true);

                $cartHeader = $this->_getCartHeader();
                $cartHeader->addItemRender('simple', 'checkout/cart_item_renderer', 'checkout/cart/sidebar/default.phtml');
                $cartHeader->addItemRender('grouped', 'checkout/cart_item_renderer_grouped', 'checkout/cart/sidebar/default.phtml');
                $cartHeader->addItemRender('configurable', 'checkout/cart_item_renderer_configurable', 'checkout/cart/sidebar/default.phtml');
                if (Mage::getSingleton('core/design_package')->getPackageName() == 'rwd'){
                    $cartHeader->setTemplate('checkout/cart/minicart/items.phtml');
                } else {
                    $cartHeader->setTemplate('checkout/cart/cartheader.phtml');
                }

                $count = $cart->getQuote()->getItemsQty();
                $addClass = '';
                
                if ($count == 1) {
                    $topLinkCart = Mage::helper('checkout')->__('My Cart (%s item)', $count);
                } elseif ($count > 0) {
                    $topLinkCart = Mage::helper('checkout')->__('My Cart (%s items)', $count);
                } else {
                    $topLinkCart = Mage::helper('checkout')->__('My Cart');
                    $addClass = 'no-count';
                }
                                
                $result['error'] = false;
                $result['data'] = array(
                        '.top-link-cart' => array(
                                'html' => $topLinkCart,
                        ),
                        '.skip-cart .count' => array(
                                'html' => $count,
                        ),
                        '.skip-cart' => array(
                                'addClass' => $addClass,
                        ),
                        '#header-cart' => array(
                                'html' => $cartHeader->toHtml(),
                        ),
                        '.top-cart' => array(
                                'html' => $cartHeader->toHtml(),
                        ),
                );                
                
            } catch (Exception $e) {

                $result['error'] = true;
                $result['data'] = $e->getMessage();
            }
        } else {

            $result['error'] = true;
            $result['data'] = 'No item';
        }

        $resultJson = json_encode($result);

        $this->getResponse()->setHeader('Content-type', 'application/json')->setBody($resultJson);
    }

}
