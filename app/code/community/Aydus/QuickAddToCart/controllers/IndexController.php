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
     * Load breadcrumbs
     * 
     * @return Aydus_QuickAddToCart_IndexController
     */
    protected function _loadCrumbs()
    {
        $crumbs = $this->getLayout()->getBlock('breadcrumbs');
        
        $crumbs->addCrumb('home', array(
                'label' => $this->__('Home'),
                'title' => $this->__('Go to Home Page'),
                'link' => Mage::getUrl('')
        ));
        $crumbs->addCrumb('quickaddtocart', array(
                'label' => Mage::helper('aydus_quickaddtocart')->__('Quick Add to Cart'),
                'title' => Mage::helper('aydus_quickaddtocart')->__('Quick Add to Cart'),
                'link' => null,
        ));
        
        return $this;
    }
    
    /**
     * Display quickaddtocart page
     */
    public function indexAction() {
        $this->loadLayout()->_loadCrumbs()->renderLayout();
    }

    /**
     * Get search results
     */
    public function searchAction() {

        $result = array();
        $query = Mage::helper('catalogsearch')->getQuery();
        
        $query->setStoreId(Mage::app()->getStore()->getId());
        
        if ($query->getQueryText() != '') {
            
            if (Mage::helper('catalogsearch')->isMinQueryLength()) {
                $query->setId(0)
                ->setIsActive(1)
                ->setIsProcessed(1);
            }
            else {
                if ($query->getId()) {
                    $query->setPopularity($query->getPopularity()+1);
                }
                else {
                    $query->setPopularity(1);
                }
        
                if ($query->getRedirect()){
                    $query->save();
                    $this->getResponse()->setRedirect($query->getRedirect());
                    return;
                }
                else {
                    $query->prepare();
                }
            }
                       
            Mage::helper('catalogsearch')->checkNotes();
            
            $this->loadLayout();
            $layout = $this->getLayout();
            $root = $layout->getBlock('root');
            $searchResult = $layout->getBlock('search.result');
            
            $result['error'] = false;
            $result['count'] = $searchResult->getResultCount();
            $result['data'] = $root->toHtml();
            $result['translate'] = array(
                    'Add to Cart' => Mage::helper('catalog')->__('Add to Cart')
            );
                                                
            if (!Mage::helper('catalogsearch')->isMinQueryLength()) {
                $query->save();
            }
            
        } else {
            $result['error'] = true;
            $result['data'] = 'No query submitted';
        }
                
        $this->getResponse()->setHeader('Content-type', 'application/json')->setBody(json_encode($result));
    }
    
    /**
     * Get configurable/bundle product options
     */
    public function optionsAction()
    {
        $result = array();
        $productId = (int) $this->getRequest()->getParam('product_id');
        
        if ($productId){
            
            $storeId = Mage::app()->getStore()->getId();
            $product = Mage::getModel('catalog/product')->setStoreId($storeId);
            $product->load($productId);
            
            Mage::register('product', $product);
            Mage::register('current_product', $product);
            
            $this->loadLayout();
            $layout = $this->getLayout();
            $typeID = $product->getTypeID();
                
            $wrapper = $layout->getBlock($typeID.'.options');
            $html = $wrapper->toHtml();
                
            $result['error'] = false;
            $result['data'] = $html;
            
        } else {
            
            $result['error'] = true;
            $result['data'] = 'Product id is required';
        }
        
        $this->getResponse()->setHeader('Content-type', 'application/json')->setBody(json_encode($result));
    }
    
    /**
     * Add to cart
     */
    public function addtocartAction() {
        
        $data = $this->getRequest()->getPost();
        $productId = (int)$data['product'];
        $qty = (int)$data['qty'];
        $result = array();

        if ($productId && $qty) {

            try {
                $cart = Mage::getSingleton('checkout/cart');
                $cart->init();
                $product = Mage::getModel('catalog/product')->setStoreId(Mage::app()->getStore()->getId())->load($productId);
                $cart->addProduct($product, $data);
                $cart->save();
                Mage::getSingleton('checkout/session')->setCartWasUpdated(true);

                $cartHeader = $this->_getCartHeader();

                $result['error'] = false;
                $result['data'] = $cartHeader;
                
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
        $cartHeader->addItemRender('simple', 'checkout/cart_item_renderer', 'checkout/cart/sidebar/default.phtml');
        $cartHeader->addItemRender('grouped', 'checkout/cart_item_renderer_grouped', 'checkout/cart/sidebar/default.phtml');
        $cartHeader->addItemRender('configurable', 'checkout/cart_item_renderer_configurable', 'checkout/cart/sidebar/default.phtml');
        if (Mage::getSingleton('core/design_package')->getPackageName() == 'rwd'){
            $cartHeader->setTemplate('checkout/cart/minicart/items.phtml');
        } else {
            $cartHeader->setTemplate('checkout/cart/cartheader.phtml');
        }
        
        $cart = Mage::getSingleton('checkout/cart');
        $count = $cart->getQuote()->getItemsQty();
        $addClass = '';
        $removeClass = '';
        
        if ($count == 1) {
            $topLinkCart = Mage::helper('checkout')->__('My Cart (%s item)', $count);
            $removeClass = 'no-count';
        } elseif ($count > 0) {
            $topLinkCart = Mage::helper('checkout')->__('My Cart (%s items)', $count);
            $removeClass = 'no-count';
        } else {
            $topLinkCart = Mage::helper('checkout')->__('My Cart');
            $addClass = 'no-count';
        }        
        
        $data = array(
                '.top-link-cart' => array(
                        'html' => $topLinkCart,
                ),
                '.skip-cart .count' => array(
                        'html' => $count,
                ),
                '.skip-cart' => array(
                        'removeClass' => $removeClass,
                        'addClass' => $addClass,
                ),
                '#header-cart' => array(
                        'html' => $cartHeader->toHtml(),
                ),
                '.top-cart' => array(
                        'html' => $cartHeader->toHtml(),
                ),
        );
        
        return $data;
    }

    /**
     * Get cart items
     */
    public function cartAction() {
        
        $cartHeader = $this->getLayout()->createBlock('checkout/cart_sidebar');
        $cartHeader->addItemRender('simple', 'checkout/cart_item_renderer', 'checkout/cart/item/default.phtml');
        $cartHeader->addItemRender('grouped', 'checkout/cart_item_renderer_grouped', 'checkout/cart/item/default.phtml');
        $cartHeader->addItemRender('configurable', 'checkout/cart_item_renderer_configurable', 'checkout/cart/item/default.phtml');
        $cartHeader->addItemRender('bundle', 'bundle/checkout_cart_item_renderer', 'checkout/cart/item/default.phtml');
        
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
                $cart = Mage::getSingleton('checkout/cart');
                $cart->init();
                $cart->updateItem($itemId, array('qty'=>$qty));
                $cart->save();
                Mage::getSingleton('checkout/session')->setCartWasUpdated(true);
        
                $cartHeader = $this->_getCartHeader();
        
                $result['error'] = false;
                $result['data'] = $cartHeader;
        
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
                $cart = Mage::getSingleton('checkout/cart');
                $cart->init();
                $cart->removeItem($itemId);
                $cart->save();
                Mage::getSingleton('checkout/session')->setCartWasUpdated(true);

                $cartHeader = $this->_getCartHeader();
                                
                $result['error'] = false;
                $result['data'] = $cartHeader;                
                
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
