<?php

/**
 * Quick addtocart block
 *
 * @category    Aydus
 * @package     Aydus_QuickAddToCart
 * @author     	Aydus Consulting <davidt@aydus.com>
 */

class Aydus_QuickAddToCart_Block_Index extends Mage_Core_Block_Template
{

	/**
	 * Get search query
	 * 
	 * return string
	 */
	public function getQuery()
	{
		$q = $this->getRequest()->getParam('q');
		return $q;
	}
	
}