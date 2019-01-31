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
$id = 'seoclick_slider_' . $module->id . '_' . rand(1, 9999999);
?>
    <div id="<?= $id ?>" class="seoclick-slider">
        <div class="slides-wrap">
            <div class="slider-view" <? if (!$show_neighbor_slides): ?>style="overflow: hidden"<? endif; ?>>
                <div class="slides-container">
					<?php foreach ($slides as $index => $slide): ?>
						<?php if (!empty($slide['url'])): ?>
                            <a href="<?= $slide['url']; ?>" <?php if ($slide['url_open']): ?>target="_blank"<?php endif; ?> rel="nofollow noopener noreferrer">
						<?php endif; ?>
                        <div class="slide">
                            <div class="slide-content">
                                <?php if($slide['image']): ?>
                                    <div class="image">
                                        <img <?php if($lazy_load):?>ref<?php else:?>src<?php endif;?>="/<?= $slide['image'] ?>" alt="slide_<?= $counter++ ?>"/>
                                    </div>
                                <?php endif; ?>
                                <?php if ($desc_block): ?>
                                    <div class="slide-description">
			                            <?php if(!empty($slide['header'])):?>
                                        <div class="content top"><span class="name"><?= $slide['header'] ?></span></div>
			                            <?php endif;?>
				                        <?php if(!empty($slide['description'])):?>
                                        <div class="content bottom">
                                            <?= $slide['description'] ?>
                                        </div>
				                        <?php endif;?>
                                    </div>
                                <?php endif;?>
                            </div>
                        </div>
						<?php if (!empty($slide['url'])): ?>
                            </a>
						<?php endif; ?>
					<?php endforeach ?>
                </div>
            </div>
        </div>
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
if(!$infinite_mode) $extra_arrow_class = 'disabled';
$document->addScriptDeclaration('
    jQuery(window).load(function() {
     
    let $ = jQuery, slider, arrows_markup = {};
        
        arrows_markup.left = "<i class=\"fa fa-angle-left fa-4x '.$extra_arrow_class.'\" aria-hidden=\"true\"></i>";
        arrows_markup.right = "<i class=\"fa fa-angle-right fa-4x\" aria-hidden=\"true\"></i>";
                          
        slider = new SeoClickSlider({
            id: "#' . $id . '",
            viewed: ' . $slides_viewed . ',
            spacerWidth: ' . $images_space . ',
            imageWidth: ' . $images_width . ',
            imageHeight: ' . $images_height . ',
            slideWidth: '.$slide_width.',
            ' . $nav . ',
            arrowsMarkup: arrows_markup,
            desc_block: false,
            infiniteMode: ' . $infinite_mode . ',
            autoScroll: {
                active: ' . $auto_scroll . ',
                interval: ' . $auto_scroll_interval . ',
                animation_speed: '.$animation_speed.'
            },
            lazy_load: '.$lazy_load.'
        });
    });
    ');