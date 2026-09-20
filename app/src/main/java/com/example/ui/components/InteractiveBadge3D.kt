package com.example.ui.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Badge
import androidx.compose.material.icons.filled.Fingerprint
import androidx.compose.material.icons.filled.QrCode2
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Verified
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch

/**
 * An interactive 3D ID Badge inspired by the user's HTML portfolio ID Badge & 3D canvas.
 * Supports drag-to-tilt with spring return and dynamic holographic shimmer.
 */
@Composable
fun InteractiveBadge3D(
  modifier: Modifier = Modifier,
  studentName: String = "Aditya Santosh Tyade",
  university: String = "SANJIVANI UNIVERSITY",
  program: String = "Integrated B.Tech CSE",
  cgpa: String = "8.0",
  academicYear: String = "2024 - 2026"
) {
  val coroutineScope = rememberCoroutineScope()
  val density = LocalDensity.current

  // Rotational angles for 3D perspective effect
  val rotX = remember { Animatable(-3f) }
  val rotY = remember { Animatable(6f) }
  val lightOffsetX = remember { Animatable(0.3f) }

  Box(
    modifier = modifier
      .fillMaxWidth()
      .padding(vertical = 8.dp),
    contentAlignment = Alignment.Center
  ) {
    Surface(
      modifier = Modifier
        .width(320.dp)
        .graphicsLayer {
          cameraDistance = 14f * density.density
          rotationX = rotX.value
          rotationY = rotY.value
          shadowElevation = 24.dp.toPx()
          shape = RoundedCornerShape(20.dp)
          clip = true
        }
        .shadow(
          elevation = 20.dp,
          shape = RoundedCornerShape(20.dp),
          spotColor = Color(0xFF06B6D4),
          ambientColor = Color(0x60000000)
        )
        .pointerInput(Unit) {
          detectDragGestures(
            onDragStart = { },
            onDragEnd = {
              coroutineScope.launch {
                rotX.animateTo(
                  -3f,
                  spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessLow)
                )
              }
              coroutineScope.launch {
                rotY.animateTo(
                  6f,
                  spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessLow)
                )
              }
              coroutineScope.launch {
                lightOffsetX.animateTo(0.3f, spring(stiffness = Spring.StiffnessLow))
              }
            },
            onDragCancel = {
              coroutineScope.launch { rotX.animateTo(-3f) }
              coroutineScope.launch { rotY.animateTo(6f) }
            },
            onDrag = { change, dragAmount ->
              change.consume()
              val newX = (rotX.value - dragAmount.y * 0.15f).coerceIn(-22f, 22f)
              val newY = (rotY.value + dragAmount.x * 0.15f).coerceIn(-22f, 22f)
              coroutineScope.launch { rotX.snapTo(newX) }
              coroutineScope.launch { rotY.snapTo(newY) }
              coroutineScope.launch {
                val newLight = (lightOffsetX.value + dragAmount.x * 0.003f).coerceIn(0f, 1f)
                lightOffsetX.snapTo(newLight)
              }
            }
          )
        },
      shape = RoundedCornerShape(20.dp),
      color = Color(0xFF0F172A)
    ) {
      Box(
        modifier = Modifier
          .fillMaxWidth()
          .background(
            Brush.linearGradient(
              colors = listOf(
                Color(0xFF0B1329),
                Color(0xFF131D3B),
                Color(0xFF1E293B)
              ),
              start = Offset(0f, 0f),
              end = Offset(600f, 900f)
            )
          )
          .border(
            width = 1.5.dp,
            brush = Brush.linearGradient(
              colors = listOf(
                Color(0xFF38BDF8).copy(alpha = 0.8f),
                Color(0xFF818CF8).copy(alpha = 0.5f),
                Color(0xFF06B6D4).copy(alpha = 0.2f)
              )
            ),
            shape = RoundedCornerShape(20.dp)
          )
          .padding(18.dp)
      ) {
        // Holographic sheen layer overlay
        Box(
          modifier = Modifier
            .matchParentSize()
            .background(
              Brush.linearGradient(
                colors = listOf(
                  Color.Transparent,
                  Color.White.copy(alpha = 0.06f),
                  Color(0xFF67E8F9).copy(alpha = 0.12f),
                  Color.Transparent
                ),
                start = Offset(lightOffsetX.value * 600f, 0f),
                end = Offset((lightOffsetX.value + 0.4f) * 600f, 900f)
              )
            )
        )

        Column {
          // Top University Header
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Box(
                modifier = Modifier
                  .size(36.dp)
                  .clip(CircleShape)
                  .background(Color(0xFF0284C7).copy(alpha = 0.25f))
                  .border(1.dp, Color(0xFF38BDF8), CircleShape),
                contentAlignment = Alignment.Center
              ) {
                Icon(
                  imageVector = Icons.Default.School,
                  contentDescription = "University",
                  tint = Color(0xFF38BDF8),
                  modifier = Modifier.size(20.dp)
                )
              }
              Spacer(modifier = Modifier.width(10.dp))
              Column {
                Text(
                  text = university,
                  color = Color.White,
                  fontSize = 11.sp,
                  fontWeight = FontWeight.Bold,
                  letterSpacing = 1.sp
                )
                Text(
                  text = "COLLEGE OF ENGINEERING",
                  color = Color(0xFF94A3B8),
                  fontSize = 8.5.sp,
                  letterSpacing = 0.5.sp
                )
              }
            }

            // Holographic chip icon
            Box(
              modifier = Modifier
                .size(28.dp)
                .clip(RoundedCornerShape(6.dp))
                .background(
                  Brush.linearGradient(
                    colors = listOf(Color(0xFFF59E0B), Color(0xFFD97706), Color(0xFFB45309))
                  )
                )
                .border(1.dp, Color(0xFFFDE68A), RoundedCornerShape(6.dp)),
              contentAlignment = Alignment.Center
            ) {
              Icon(
                imageVector = Icons.Default.Fingerprint,
                contentDescription = "Security Chip",
                tint = Color(0xFF78350F),
                modifier = Modifier.size(18.dp)
              )
            }
          }

          Spacer(modifier = Modifier.height(16.dp))

          // Middle Profile & Verification
          Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
          ) {
            // Stylized ID Avatar
            Box(
              modifier = Modifier
                .size(72.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(
                  Brush.linearGradient(
                    colors = listOf(Color(0xFF0284C7), Color(0xFF4F46E5))
                  )
                )
                .border(2.dp, Color(0xFF38BDF8), RoundedCornerShape(16.dp)),
              contentAlignment = Alignment.Center
            ) {
              Text(
                text = "AT",
                color = Color.White,
                fontSize = 26.sp,
                fontWeight = FontWeight.ExtraBold,
                letterSpacing = 1.5.sp
              )
            }

            Spacer(modifier = Modifier.width(14.dp))

            Column(modifier = Modifier.weight(1f)) {
              Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                  text = studentName,
                  color = Color.White,
                  fontSize = 15.sp,
                  fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.width(4.dp))
                Icon(
                  imageVector = Icons.Default.Verified,
                  contentDescription = "Verified Student",
                  tint = Color(0xFF38BDF8),
                  modifier = Modifier.size(16.dp)
                )
              }
              Spacer(modifier = Modifier.height(3.dp))
              Text(
                text = program,
                color = Color(0xFF38BDF8),
                fontSize = 11.5.sp,
                fontWeight = FontWeight.Medium
              )
              Spacer(modifier = Modifier.height(2.dp))
              Text(
                text = "Roll ID: SAN-CSE-2024-80",
                color = Color(0xFF94A3B8),
                fontSize = 9.sp,
                fontFamily = FontFamily.Monospace
              )
            }
          }

          Spacer(modifier = Modifier.height(14.dp))

          // Stats Pill Row
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .clip(RoundedCornerShape(10.dp))
              .background(Color(0xFF1E293B).copy(alpha = 0.8f))
              .padding(horizontal = 12.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Column {
              Text(text = "CURRENT CGPA", color = Color(0xFF94A3B8), fontSize = 8.sp, fontWeight = FontWeight.Bold)
              Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                  imageVector = Icons.Default.Star,
                  contentDescription = null,
                  tint = Color(0xFFF59E0B),
                  modifier = Modifier.size(12.dp)
                )
                Spacer(modifier = Modifier.width(3.dp))
                Text(text = "$cgpa / 10.0", color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.ExtraBold)
              }
            }

            Box(
              modifier = Modifier
                .width(1.dp)
                .height(24.dp)
                .background(Color(0xFF334155))
            )

            Column {
              Text(text = "STATUS", color = Color(0xFF94A3B8), fontSize = 8.sp, fontWeight = FontWeight.Bold)
              Text(text = "Enrolled", color = Color(0xFF10B981), fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            }

            Box(
              modifier = Modifier
                .width(1.dp)
                .height(24.dp)
                .background(Color(0xFF334155))
            )

            Column(horizontalAlignment = Alignment.End) {
              Text(text = "TENURE", color = Color(0xFF94A3B8), fontSize = 8.sp, fontWeight = FontWeight.Bold)
              Text(text = academicYear, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Medium)
            }
          }

          Spacer(modifier = Modifier.height(12.dp))

          // Bottom Barcode / Tech Security strip
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Icon(
                imageVector = Icons.Default.QrCode2,
                contentDescription = "Badge QR",
                tint = Color(0xFF94A3B8),
                modifier = Modifier.size(20.dp)
              )
              Spacer(modifier = Modifier.width(6.dp))
              Text(
                text = "INTERACTIVE 3D BADGE • DRAG TO TILT",
                color = Color(0xFF64748B),
                fontSize = 8.sp,
                letterSpacing = 0.5.sp,
                fontWeight = FontWeight.SemiBold
              )
            }

            Icon(
              imageVector = Icons.Default.Badge,
              contentDescription = null,
              tint = Color(0xFF38BDF8).copy(alpha = 0.6f),
              modifier = Modifier.size(18.dp)
            )
          }
        }
      }
    }
  }
}
