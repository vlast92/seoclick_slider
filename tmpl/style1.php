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
?>
    <div id="<?= $id ?>" class="seoclick-slider" style="height: 0;overflow: hidden;">
        <?php $counter = 0; ?>
        <?php foreach ($slides as $index => $slide): ?>
            <?php if (!empty($slide['url'])): ?>
                <a href="<?= $slide['url']; ?>" class="slide"
                <?php if ($slide['url_open']): ?>target="_blank"<?php endif; ?>
                rel="nofollow noopener noreferrer">
            <?php else: ?>
                <div class="slide">
            <?php endif; ?>
            <div class="slide-content">
                <?php if ($slide['image']): ?>
                    <div class="image">
                        <?php require JModuleHelper::getLayoutPath('mod_seoclick_slider', 'slide_image'); ?>
                    </div>
                <?php endif; ?>
            </div>
            <?php if (!empty($slide['url'])): ?>
                </a>
            <?php else: ?>
                </div>
            <?php endif; ?>
        <?php endforeach ?>
    </div>
    <div class="slides-description">
        <div class="container">
			<?php $counter = 0; ?>
			<?php foreach ($slides as $slide): ?>
				<?php if ($slide['desc_block']): ?>
                    <div class="<?php if ($counter == 0) echo 'active' ?> slide-description slide-<?= $counter++ ?>">
                        <div class="heading"><?= jText::_("MOD_SEOCLICK_SLIDER_DESCBLOCK_HEAD_LABEL"); ?></div>
                        <div class="content top"><span class="name"><?= $slide['header'] ?></span></div>
                        <div class="heading"><?= jText::_("MOD_SEOCLICK_SLIDER_DESCBLOCK_DESCRIPTION_LABEL"); ?></div>
                        <div class="content bottom">
							<?= nl2br($slide['description']) ?>
                        </div>
                    </div>
				<?php endif; ?>
			<?php endforeach; ?>
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
$document->addScriptDeclaration('
    jQuery(function($) {
     
    let slider, arrows_markup = {};
        
        arrows_markup.left = "<i class=\"fa fa-angle-left fa-4x\" aria-hidden=\"true\"></i>";
        arrows_markup.right = "<i class=\"fa fa-angle-right fa-4x\" aria-hidden=\"true\"></i>";
                          
        slider = new SeoClickSlider({
            sliderSelector: "#' . $id . '",
            sliderItemSelector: ".slide",
            viewed: 1,
            spacerMinWidth: ' . $images_space . ',
            imageWidth: ' . $images_width . ',
            imageHeight: ' . $images_height . ',
            slideWidth: ' . $slide_width . ',
            ' . $nav . ',
            arrowsMarkup: arrows_markup,
            desc_block: true,
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
