<?php
/**
 * @package    seoclick_slider
 *
 * @author     Vlast <your@email.com>
 * @copyright  A copyright
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 * @link       http://your.url.com
 */

use Joomla\CMS\Helper\ModuleHelper;

$module_path = '/modules/mod_seoclick_slider';
require_once dirname(__FILE__) . '/helper.php';

defined('_JEXEC') or die;

JHtml::_('jquery.framework');
$document = &JFactory::getDocument();
$document->addScript($module_path . '/assets/js/anime.min.js');
$document->addScript($module_path . '/assets/js/hammer.min.js');
$document->addScript($module_path . '/assets/js/seoclickSlider.js?v=' . filemtime(dirname(__FILE__) . '/assets/js/seoclickSlider.js'));
$document->addStyleSheet($module_path . '/assets/css/seoclick_slider_styles.css?v=' . filemtime(dirname(__FILE__) . '/assets/css/seoclick_slider_styles.css'));

$slides = json_decode(json_encode($params->get("slides")), true);
$nav_type = $params->get('nav_type');
$desc_block = $params->get('desc_block');
$images_width = $params->get('images_width', '800');
$images_height = $params->get('images_height', '400');
$images_space = $params->get('images_space', '0');
$infinite_mode = $params->get('infinite_mode');
$show_neighbor_slides = $params->get('neighbor_slides');
$auto_scroll = $params->get('auto_scroll');
$auto_scroll_interval = $params->get('auto_scroll_interval','2000');

$moduleclass_sfx = htmlspecialchars($params->get('moduleclass_sfx'));

foreach($slides as $key=>$slide ){
	$image_info = getimagesize($_SERVER['DOCUMENT_ROOT'].'/'.$slide['image']);

	switch ($params->get('resize_method')){
		case 'crop':
			$slides[$key]['image'] = ModSeoclickSliderHelper::crop($slide['image'], $image_info['mime'], $image_info[0],
				$image_info[1], $images_width, $images_height);
			break;
		case 'resize_ratio':
			$data = ModSeoclickSliderHelper::resize($slide['image'], $image_info['mime'], $image_info[0],
				$image_info[1], $images_width, $images_height);
			if(is_array($data)) $data = $data['resize_image_path'];
			$slides[$key]['image'] = $data;
			break;
		case 'resize_no_ratio':
			$data = ModSeoclickSliderHelper::resize($slide['image'], $image_info['mime'], $image_info[0],
				$image_info[1], $images_width, $images_height, false);
			if(is_array($data)) $data = $data['resize_image_path'];
			$slides[$key]['image'] = $data;
			break;
	}

	$slides[$key]['image'] .= '?v='.filemtime($_SERVER['DOCUMENT_ROOT'].'/'.$slides[$key]['image']);
}

require ModuleHelper::getLayoutPath('mod_seoclick_slider', $params->get('layout', 'default'));