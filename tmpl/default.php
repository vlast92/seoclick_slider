<?php
/**
 * @package    seoclick_slider
 *
 * @author     Vlast <your@email.com>
 * @copyright  A copyright
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 * @link       http://your.url.com
 */

defined('_JEXEC') or die;
$id = 'seoclick-slider_' . $module->id . '_' . rand(1, 9999999);
?>
    <div id="<?= $id ?>" class="seoclick-slider">
        <div class="slides-wrap">
            <div class="slider-view" <? if (!$show_neighbor_slides): ?>style="overflow: hidden"<? endif; ?>>
                <div class="slides-container">
					<?php $counter = 0; ?>
					<?php foreach ($slides as $index => $slide): ?>
						<?php if (!empty($slide['url'])): ?>
                            <a href="<?= $slide['url']; ?>" <?php if ($slide['url_open']): ?>target="_blank"<?php endif; ?> rel="nofollow noopener noreferrer">
						<?php endif; ?>
                        <div class="slide">
                            <div class="slide-content">
                                <div class="image">
                                    <img <?php if($lazy_load):?>ref<?php else:?>src<?php endif;?>="/<?= $slide['image'] ?>" alt="slide_<?= $counter++ ?>"/>
                                </div>
                            </div>
                        </div>
						<?php if (!empty($slide['url'])): ?>
                            </a>
						<?php endif; ?>
					<?php endforeach ?>
                </div>
            </div>
        </div>
		<?php if ($desc_block): ?>
            <div class="slides-description">
				<?php $counter = 0; ?>
				<?php foreach ($slides as $slide): ?>
                    <div class="<?php if ($counter == 0) echo 'active' ?> slide-description slide-<?= $counter++ ?>">
                        <div class="heading"><?= jText::_("MOD_SEOCLICK_SLIDER_DESCBLOCK_HEAD_LABEL"); ?></div>
                        <div class="content top"><span class="name"><?= $slide['header'] ?></span></div>
                        <div class="heading"><?= jText::_("MOD_SEOCLICK_SLIDER_DESCBLOCK_DESCRIPTION_LABEL"); ?></div>
                        <div class="content bottom">
							<?= $slide['description'] ?>
                        </div>
                    </div>
				<?php endforeach; ?>
            </div>
		<?php endif; ?>
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
    jQuery(document).ready(function() {
     
    let $ = jQuery,
        slider = new SeoClickSlider({
            id: "#' . $id . '",
            viewed: ' . $slides_viewed . ',
            spacerWidth: ' . $images_space . ',
            imageWidth: ' . $images_width . ',
            imageHeight: '.$images_height.',
            slideWidth: '.$slide_width.',
            ' . $nav . ',
            desc_block: ' . $desc_block . ',
            infiniteMode: ' . $infinite_mode . ',
            autoScroll: {
                active: ' . $auto_scroll . ',
                interval: ' . $auto_scroll_interval . ',
                animation_speed: '.$animation_speed.'
            },
            lazy_load: '.$lazy_load.'
        }),
        desc = $("#' . $id . '").find(".slide-description");
        $("#' . $id . '").find(".slides-description").css("min-height", desc.outerHeight(true)); 
    });
    ');