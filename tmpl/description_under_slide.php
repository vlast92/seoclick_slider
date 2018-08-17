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
$id = 'seoclick-slider_' . rand(1, 9999999);
?>
    <div id="<?= $id ?>" class="seoclick-slider">
        <div class="slides-wrap">
            <div class="slider-view" <? if (!$show_neighbor_slides): ?>style="overflow: hidden"<? endif; ?>>
                <div class="slides-container">
					<?php $counter = 2; ?>
					<?php foreach ($slides as $index => $slide): ?>
						<?php if (!empty($slide['url'])): ?>
                            <a href="<?= $slide['url']; ?>" <?php if ($slide['url_open']): ?>target="_blank"<?php endif; ?> rel="nofollow noopener noreferrer">
						<?php endif; ?>
                        <div class="slide">
                            <div class="slide-content">
                                <?php if($counter%2 == 0):?>
                                <div class="image">
                                    <img src="/<?= $slide['image'] ?>" alt="slide_<?= $counter++ ?>"/>
                                </div>
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
                                <?php else:?>
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
                                    <div class="image">
                                        <img src="/<?= $slide['image'] ?>" alt="slide_<?= $counter++ ?>"/>
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
$document->addScriptDeclaration('
    jQuery(window).load(function() {
     
    let $ = jQuery,
        slider = new SeoClickSlider({
            id: "#' . $id . '",
            viewed: ' . $slides_viewed . ',
            spacerWidth: ' . $images_space . ',
            imageWidth: ' . $images_width . ',
            ' . $nav . ',
            desc_block: false,
            infiniteMode: ' . $infinite_mode . ',
            autoScroll: {
                active: ' . $auto_scroll . ',
                interval: ' . $auto_scroll_interval . '
            }
        }),
        desc = $("#' . $id . '").find(".slide-description");
        $("#' . $id . '").find(".slides-description").css("min-height", desc.outerHeight(true)); 
    });
    ');