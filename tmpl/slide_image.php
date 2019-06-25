<?php
defined('_JEXEC') or die; ?>

<img <?php if ($responsive_images && $slide['responsive_images']): ?>
	<?php if ($lazy_load): ?>data-<?php endif; ?>srcset="<?php foreach ($slide['responsive_images']['srcset'] as $key => $responsiveImageSrcset)
	{
		if ($key == 'default')
		{
			echo $slide['image'] . ' ' . $responsiveImageSrcset['width'] . 'w';
		}
		else
		{
			echo $responsiveImageSrcset['path'] . ' ' . $responsiveImageSrcset['width'] . 'w,';
		}
	} ?>"
    <?php if($slide['responsive_images']['sizes']): ?>
		<?php if ($lazy_load): ?>data-<?php endif; ?>sizes="<?php foreach ($slide['responsive_images']['sizes'] as $key => $responsiveImageSize)
		{

			echo '(max-width: ' . $responsiveImageSize['viewport_width'] . 'px) ' . $responsiveImageSize['image_width'] . 'px,';
		}
		echo $images_width . 'px';
		?>"
    <?php endif;?>
<?php endif; ?>
	<?php if ($lazy_load): ?>data-<?php endif; ?>src="<?= $slide['image'] ?>"
    alt="slide_<?= $counter++ ?>"/>