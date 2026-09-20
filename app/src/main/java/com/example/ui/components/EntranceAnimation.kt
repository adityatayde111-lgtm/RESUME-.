package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * Provides a staggered, elegant entrance animation with fade-in and smooth upward slide.
 * Allows specifying an index delay for natural cascade effects across grid items.
 */
@Composable
fun StaggeredEntrance(
  index: Int,
  modifier: Modifier = Modifier,
  baseDelayMs: Long = 40L,
  durationMs: Int = 450,
  content: @Composable () -> Unit
) {
  val alpha = remember { Animatable(0f) }
  val translateY = remember { Animatable(32f) }
  val scale = remember { Animatable(0.96f) }

  LaunchedEffect(index) {
    delay(index * baseDelayMs)
    // Run animations concurrently in the LaunchedEffect CoroutineScope
    launch {
      alpha.animateTo(
        targetValue = 1f,
        animationSpec = tween(durationMillis = durationMs, easing = FastOutSlowInEasing)
      )
    }
    launch {
      translateY.animateTo(
        targetValue = 0f,
        animationSpec = spring(
          dampingRatio = Spring.DampingRatioLowBouncy,
          stiffness = Spring.StiffnessMediumLow
        )
      )
    }
    launch {
      scale.animateTo(
        targetValue = 1f,
        animationSpec = spring(
          dampingRatio = Spring.DampingRatioMediumBouncy,
          stiffness = Spring.StiffnessMediumLow
        )
      )
    }
  }

  Box(
    modifier = modifier.graphicsLayer {
      this.alpha = alpha.value
      this.translationY = translateY.value
      this.scaleX = scale.value
      this.scaleY = scale.value
    }
  ) {
    content()
  }
}
