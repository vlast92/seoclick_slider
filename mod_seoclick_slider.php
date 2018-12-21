<?php
/**
 * @package    seoclick_slider
 *
 * @author     Vlast <vlasteg@mail.ru>
 * @copyright  A copyright
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 * @link       https://seoclick.by
 */

use Joomla\CMS\Helper\ModuleHelper;

$module_path = '/modules/mod_seoclick_slider';
require_once dirname(__FILE__) . '/helper.php';

defined('_JEXEC') or die;

JHtml::_('jquery.framework');
$document = &JFactory::getDocument();
$document->addScript($module_path . '/assets/js/anime.min.js');
$document->addScript($module_path . '/assets/js/hammer.min.js');
$document->addScript($module_path . '/assets/js/seoclickSlider.min.js?v=' . filemtime(dirname(__FILE__) . '/assets/js/seoclickSlider.min.js'));
$document->addStyleSheet($module_path . '/assets/css/seoclick_slider_styles.css?v=' . filemtime(dirname(__FILE__) . '/assets/css/seoclick_slider_styles.css'));
$document->addStyleSheet("https://use.fontawesome.com/releases/v5.6.1/css/all.css");

$slides = json_decode(json_encode($params->get("slides")), true);
$nav_type = $params->get('nav_type');
$desc_block = $params->get('desc_block');
$images_width = $params->get('images_width', '800');
$images_height = $params->get('images_height', '400');
$images_space = $params->get('images_space', '0');
$slide_width = $params->get('slide_width', $images_width);
$infinite_mode = $params->get('infinite_mode');
$show_neighbor_slides = $params->get('neighbor_slides');
$auto_scroll = $params->get('auto_scroll');
$auto_scroll_interval = $params->get('auto_scroll_interval','2000');
$animation_speed = $params->get('animation_speed', '800');
$slides_viewed = $params->get('slides_viewed', 1);
$lazy_load = $params->get('lazy_load', 0);

$moduleclass_sfx = htmlspecialchars($params->get('moduleclass_sfx'));

foreach($slides as $key=>$slide ){
	$image_info = getimagesize(JPATH_BASE . '/' . $slide['image']);
	$slides[$key]['image_orig'] = $slide['image'];

	try{
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
	}catch (Exception $e){
		echo "Error while resizing image: ", $e->getMessage(), "<br/>";
	}

	$slides[$key]['image'] .= '?v='.filemtime(JPATH_BASE . '/' .$slides[$key]['image']);
}

require JModuleHelper::getLayoutPath('mod_seoclick_slider', $params->get('layout', 'default'));