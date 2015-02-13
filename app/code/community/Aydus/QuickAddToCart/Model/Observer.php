<?php

/**
 * QuickAddToCart observer
 *
 * @category    SBFilters
 * @package     Aydus_QuickAddToCart
 * @author     	Aydus Consulting <davidt@aydus.com>
 */
class Aydus_QuickAddToCart_Model_Observer 
{
	/**
	 * Redirect dealer on login to quickaddtocart
	 * 
	 * @param Varien_Event_Observer $observer
	 */
	public function quickaddtocartRedirect(Varien_Event_Observer $observer) 
	{
		$referer = Mage::helper('core/http')->getHttpReferer();
		
		if (Mage::helper('customer')->isLoggedIn() && !is_numeric(strpos($referer,'checkout'))){
			
			$customer = Mage::helper('customer')->getCustomer();
			$dealerHelper = Mage::helper('dealer');
					
			if ($dealerHelper->isDealer($customer)){
			
			    $url = Mage::getUrl('quickaddtocart');
				Mage::app()->getFrontController()->getResponse()->setRedirect($url);
				Mage::app()->getResponse()->sendResponse();
				exit();
			}
		}

	}
}


