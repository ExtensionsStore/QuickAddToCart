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
    'content' => '',
    'is_active' => 1,
    'stores' => 0
);

$block = Mage::getModel('cms/block')->load('quickaddtocart','identifier');

if (!$block->getId()) {
    
    $block->setData($data)->save();
}

echo 'QuickAddToCart setup complete.';
$installer->endSetup();