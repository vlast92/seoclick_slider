<?php
/**
 * @package    seoclick_slider
 *
 * @author     Vlast <vlasteg@mail.ru>
 * @copyright  A copyright
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 * @link       https://seoclick.by
 */

defined('_JEXEC') or die;
$id = 'seoclick_slider_' . $module->id . '_' . rand(1, 10000);
$document->addScript($module_path . '/assets/js/lightcase.js');
$document->addStyleSheet($module_path . '/assets/css/lightcase.css');
?>
    <div id="<?= $id ?>" class="seoclick-slider" style="height: 0;overflow: hidden;">
	    <?php $counter = 0; ?>
	    <?php foreach ($slides as $index => $slide): ?>
            <a href="<?= $slide['image_orig']['path']; ?>" class="slide"
               data-rel="lightcase:collection<?= $module->id ?>">
                <div class="slide-content">
				    <?php if ($slide['image']): ?>
                        <div class="image">
						    <?php require JModuleHelper::getLayoutPath('mod_seoclick_slider', 'slide_image'); ?>
                        </div>
				    <?php endif; ?>
				    <?php if ($slide['desc_block']): ?>
                        <div class="slide-description">
                            <div class="container">
							    <?php if (!empty($slide['header'])): ?>
                                    <div class="content top"><span
                                                class="name"><?= $slide['header'] ?></span></div>
							    <?php endif; ?>
							    <?php if (!empty($slide['description'])): ?>
                                    <div class="content bottom">
									    <?= $slide['description'] ?>
                                    </div>
							    <?php endif; ?>
                            </div>
                        </div>
				    <?php endif; ?>
                </div>
                <div class="zoom-icon g-grid"><i class="fa fa-arrows-alt fa-3x" aria-hidden="true"></i>
                </div>
            </a>
	    <?php endforeach ?>
    </div>
<?php
switch ($nav_type)
{
	case '0':
		$nav = 'arrowNav: false, dotNav: false';
		break;
	case '1':
		$nav = 'arrowNav: true, dotNav: false';
		break;
	case '2':
		$nav = 'arrowNav: false, dotNav: true';
		break;
	case '3':
		$nav = 'arrowNav: true, dotNav: true';
		break;
	default:
		$nav = 'arrowNav: true, dotNav: true';
}
$document->addScriptDeclaration('
    jQuery(function($) {
    
    $("#' . $id . ' a[data-rel^=lightcase]").lightcase();
     
    let slider, arrows_markup = {};
        
        arrows_markup.left = "<i class=\"fa fa-angle-left fa-4x\" aria-hidden=\"true\"></i>";
        arrows_markup.right = "<i class=\"fa fa-angle-right fa-4x\" aria-hidden=\"true\"></i>";
                          
        slider = new SeoClickSlider({
            sliderSelector: "#' . $id . '",
            sliderItemSelector: ".slide",
            viewed: ' . $slides_viewed . ',
            spacerMinWidth: ' . $images_space . ',
            imageWidth: ' . $images_width . ',
            imageHeight: ' . $images_height . ',
            slideWidth: ' . $slide_width . ',
            ' . $nav . ',
            arrowsMarkup: arrows_markup,
            desc_block: false,
            infiniteMode: ' . $infinite_mode . ',
            autoScroll: {
                active: ' . $auto_scroll . ',
                interval: ' . $auto_scroll_interval . ',
                animation_speed: ' . $animation_speed . '
            },
            lazy_load: ' . $lazy_load . ',
            debug: ' . $debug . ',
            responsiveData: ' . $responsive_data . '
        });
    });
    ');