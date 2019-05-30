<?php
/**
 * @package    seoclick_slider
 *
 * @author     Vlast <vlasteg@mail.ru>
 * @copyright  A copyright
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 * @link       https://seoclick.by
 */

//TODO разобраться с методами изменения размера изображений
//TODO почистить и оптимизировать код
use Joomla\CMS\Helper\ModuleHelper;

$module_path = '/modules/mod_seoclick_slider';
require_once dirname(__FILE__) . '/helper.php';

defined('_JEXEC') or die;

JHtml::_('jquery.framework');
$document = &JFactory::getDocument();
$document->addScript($module_path . '/assets/js/anime.min.js');
$document->addScript($module_path . '/assets/js/hammer.min.js');

$debug = $params->get("debug_mode", 0);
if ($debug)
{
	$document->addScript($module_path . '/assets/js/seoclickSlider.js?v=' . filemtime(dirname(__FILE__) . '/assets/js/seoclickSlider.js'));
}
else
{
	$document->addScript($module_path . '/assets/js/seoclickSlider.min.js?v=' . filemtime(dirname(__FILE__) . '/assets/js/seoclickSlider.min.js'));
}
$document->addStyleSheet($module_path . '/assets/css/seoclick_slider_styles.min.css?v=' . filemtime(dirname(__FILE__) . '/assets/css/seoclick_slider_styles.min.css'));
$document->addStyleSheet("https://use.fontawesome.com/releases/v5.6.1/css/all.css");

$slides        = json_decode(json_encode($params->get("slides")), true);
$nav_type      = $params->get('nav_type');
$resize_method = $params->get('resize_method');
if ($resize_method !== 'none')
{
	$images_width  = $params->get('images_width', 0);
	$images_height = $params->get('images_height', 0);
}
else
{
	$images_width  = 0;
	$images_height = 0;
}

$images_space         = $params->get('images_space', '0');
$slide_width          = $params->get('slide_width', $images_width);
$infinite_mode        = $params->get('infinite_mode');
$show_neighbor_slides = $params->get('neighbor_slides');
$auto_scroll          = $params->get('auto_scroll');
$auto_scroll_interval = $params->get('auto_scroll_interval', '2');
$animation_speed      = $params->get('animation_speed', '800');
$slides_viewed        = $params->get('slides_viewed', 1);
$lazy_load            = $params->get('lazy_load', 0);

$responsive_images      = $params->get('responsive_images', 0);
$responsive_images_data = array();
if ($responsive_images)
{
	$responsive_images_srcset = json_decode(json_encode($params->get("responsive_images_srcset")), true);
	if($params->get('responsive_images_size_active', 0)){
		$responsive_images_sizes = json_decode(json_encode($params->get("responsive_images_sizes")), true);
	}
}

$desctop_width   = intval($params->get('desctop_width', 1200));
$laptop_width    = intval($params->get('laptop_width', 1199));
$tablet_width    = intval($params->get('tablet_width', 959));
$phone_width     = intval($params->get('phone_width', 767));
$responsive_data = json_encode(array(
	'desktop' => array(
		"width"  => $desctop_width,
		"viewed" => intval($slides_viewed)
	),
	'laptop'  => array(
		"width"  => $laptop_width,
		"viewed" => intval($params->get('laptop_viewed', 1))
	),
	'tablet'  => array(
		"width"  => $tablet_width,
		"viewed" => intval($params->get('tablet_viewed', 1))
	),
	'phone'   => array(
		"width"  => $phone_width,
		"viewed" => intval($params->get('phone_viewed', 1))
	)
));

$moduleclass_sfx = htmlspecialchars($params->get('moduleclass_sfx'));

foreach ($slides as $key => $slide)
{
	if (empty($slide['image'])) continue;
	$image_info                = getimagesize(JPATH_BASE . '/' . $slide['image']);
	$orig_image_width          = $image_info[0];
	$orig_image_height         = $image_info[1];
	$slides[$key]['image_orig']['path']   = $slide['image'];
	$slides[$key]['image_orig']['width']  = $orig_image_width;
	$slides[$key]['image_orig']['height'] = $orig_image_height;

	if(!$images_width || !$images_height){
		$images_width = $orig_image_width;
		$images_height = $orig_image_height;
	}
	$image_info['image_ratio'] = $images_width / $images_height;
	if ($resize_method !== 'none')
	{
		try
		{
			switch ($resize_method)
			{
				case 'crop':
					$slides[$key]['image'] = ModSeoclickSliderHelper::crop($slide['image'], $image_info['mime'], $orig_image_width,
						$orig_image_height, $images_width, $images_height);
					break;
				case 'resize_ratio':
					$data = ModSeoclickSliderHelper::resize($slide['image'], $image_info['mime'], $orig_image_width,
						$orig_image_height, $images_width, $images_height);
					if (is_array($data)) $data = $data['resize_image_path'];
					$slides[$key]['image'] = $data;
					break;
				case 'resize_no_ratio':
					$data = ModSeoclickSliderHelper::resize($slide['image'], $image_info['mime'], $orig_image_width,
						$orig_image_height, $images_width, $images_height, false);
					if (is_array($data)) $data = $data['resize_image_path'];
					$slides[$key]['image'] = $data;
					break;
			}
		}
		catch (Exception $e)
		{
			echo "Error while resizing image: ", $e->getMessage(), "<br/>";
		}
	}
	if ($responsive_images) $slides[$key]['responsive_images']['srcset'] =
		ModSeoclickSliderHelper::addResponsiveImages($slides[$key], $image_info, $responsive_images_srcset, $resize_method);
	$slides[$key]['responsive_images']['srcset']['default']['width'] = $images_width;

	if($responsive_images_sizes){
		$slides[$key]['responsive_images']['sizes'] = $responsive_images_sizes;
	}

	$slides[$key]['image'] .= '?v=' . filemtime(JPATH_BASE . '/' . $slides[$key]['image']);
}

require JModuleHelper::getLayoutPath('mod_seoclick_slider', $params->get('layout', 'default'));