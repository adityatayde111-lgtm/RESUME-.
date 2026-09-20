package com.example.ui.components

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddPhotoAlternate
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.PhotoCamera
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.data.PortfolioRepository

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun HeroHeader(
  onViewWorkSamples: () -> Unit,
  onOpenContact: () -> Unit,
  onShareProfile: () -> Unit,
  modifier: Modifier = Modifier,
  avatarUri: Uri? = null,
  onAvatarSelected: (Uri?) -> Unit = {}
) {
  val photoPickerLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.PickVisualMedia()
  ) { uri: Uri? ->
    if (uri != null) {
      onAvatarSelected(uri)
    }
  }

  val infiniteTransition = rememberInfiniteTransition(label = "heroGlow")
  val pulseGlow by infiniteTransition.animateFloat(
    initialValue = 0.4f,
    targetValue = 0.85f,
    animationSpec = infiniteRepeatable(
      animation = tween(durationMillis = 3000, easing = FastOutSlowInEasing),
      repeatMode = RepeatMode.Reverse
    ),
    label = "pulseGlow"
  )

  Card(
    modifier = modifier
      .fillMaxWidth()
      .testTag("hero_header_card"),
    shape = RoundedCornerShape(24.dp),
    colors = CardDefaults.cardColors(
      containerColor = Color(0xFF111827).copy(alpha = 0.95f)
    ),
    border = androidx.compose.foundation.BorderStroke(
      1.dp,
      Brush.linearGradient(
        colors = listOf(
          Color(0xFF38BDF8).copy(alpha = pulseGlow),
          Color(0xFF818CF8).copy(alpha = 0.3f),
          Color(0xFF1E293B)
        )
      )
    )
  ) {
    Box(
      modifier = Modifier
        .fillMaxWidth()
        .background(
          Brush.radialGradient(
            colors = listOf(
              Color(0xFF0284C7).copy(alpha = 0.18f),
              Color(0xFF4338CA).copy(alpha = 0.10f),
              Color.Transparent
            ),
            center = Offset(200f, 100f),
            radius = 700f
          )
        )
        .padding(24.dp)
    ) {
      Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
      ) {
        // Status indicator chip
        Surface(
          shape = RoundedCornerShape(20.dp),
          color = Color(0xFF10B981).copy(alpha = 0.15f),
          border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF10B981).copy(alpha = 0.4f)),
          modifier = Modifier.padding(bottom = 16.dp)
        ) {
          Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            Box(
              modifier = Modifier
                .size(8.dp)
                .clip(CircleShape)
                .background(Color(0xFF10B981))
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
              text = "OPEN FOR INTERNSHIPS & COLLABORATION",
              color = Color(0xFF6EE7B7),
              fontSize = 10.5.sp,
              fontWeight = FontWeight.Bold,
              letterSpacing = 0.8.sp
            )
          }
        }

        // Avatar with Glowing Accent Border and Photo Picker
        Box(
          modifier = Modifier
            .size(100.dp)
            .testTag("avatar_container"),
          contentAlignment = Alignment.Center
        ) {
          Box(
            modifier = Modifier
              .size(96.dp)
              .clip(CircleShape)
              .background(
                Brush.linearGradient(
                  colors = listOf(Color(0xFF06B6D4), Color(0xFF6366F1))
                )
              )
              .padding(3.dp)
              .clip(CircleShape)
              .background(Color(0xFF0F172A))
              .clickable {
                photoPickerLauncher.launch(
                  PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                )
              },
            contentAlignment = Alignment.Center
          ) {
            if (avatarUri != null) {
              AsyncImage(
                model = avatarUri,
                contentDescription = "Profile Photo of " + PortfolioRepository.profileName,
                modifier = Modifier
                  .fillMaxSize()
                  .clip(CircleShape),
                contentScale = ContentScale.Crop
              )
            } else {
              Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
              ) {
                Text(
                  text = "AT",
                  color = Color(0xFF38BDF8),
                  fontSize = 32.sp,
                  fontWeight = FontWeight.Black,
                  letterSpacing = 2.sp
                )
              }
            }
          }

          // Camera edit icon badge overlay
          Box(
            modifier = Modifier
              .size(30.dp)
              .align(Alignment.BottomEnd)
              .clip(CircleShape)
              .background(
                Brush.linearGradient(
                  colors = listOf(Color(0xFF0284C7), Color(0xFF6366F1))
                )
              )
              .border(2.dp, Color(0xFF0F172A), CircleShape)
              .clickable {
                photoPickerLauncher.launch(
                  PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
                )
              }
              .testTag("avatar_change_button"),
            contentAlignment = Alignment.Center
          ) {
            Icon(
              imageVector = Icons.Default.CameraAlt,
              contentDescription = "Upload profile picture",
              tint = Color.White,
              modifier = Modifier.size(16.dp)
            )
          }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Name
        Text(
          text = PortfolioRepository.profileName,
          color = Color.White,
          fontSize = 26.sp,
          fontWeight = FontWeight.ExtraBold,
          letterSpacing = 1.2.sp,
          textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(6.dp))

        // Title & University
        Text(
          text = PortfolioRepository.profileTitle,
          color = Color(0xFF38BDF8),
          fontSize = 14.5.sp,
          fontWeight = FontWeight.SemiBold,
          textAlign = TextAlign.Center
        )

        Text(
          text = PortfolioRepository.university + " • Integrated B.Tech",
          color = Color(0xFF94A3B8),
          fontSize = 12.5.sp,
          fontWeight = FontWeight.Normal,
          textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(14.dp))

        // Key stats badges in responsive flow row
        FlowRow(
          horizontalArrangement = Arrangement.Center,
          verticalArrangement = Arrangement.Center,
          maxItemsInEachRow = 3,
          modifier = Modifier.fillMaxWidth()
        ) {
          HeroStatBadge(
            icon = Icons.Default.Star,
            text = "CGPA 8.0 / 10",
            tint = Color(0xFFF59E0B)
          )
          Spacer(modifier = Modifier.width(8.dp))
          HeroStatBadge(
            icon = Icons.Default.Code,
            text = "Full-Stack & AI",
            tint = Color(0xFF38BDF8)
          )
          Spacer(modifier = Modifier.width(8.dp))
          HeroStatBadge(
            icon = Icons.Default.AutoAwesome,
            text = "Lead Coordinator",
            tint = Color(0xFFA78BFA)
          )
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Quick action buttons
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
          Button(
            onClick = onViewWorkSamples,
            modifier = Modifier
              .weight(1f)
              .height(48.dp)
              .testTag("hero_view_work_samples_button"),
            colors = ButtonDefaults.buttonColors(
              containerColor = Color(0xFF0284C7)
            ),
            shape = RoundedCornerShape(12.dp)
          ) {
            Icon(
              imageVector = Icons.Default.PlayArrow,
              contentDescription = null,
              modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
              text = "Work Samples",
              fontSize = 13.sp,
              fontWeight = FontWeight.Bold
            )
          }

          OutlinedButton(
            onClick = onOpenContact,
            modifier = Modifier
              .weight(1f)
              .height(48.dp)
              .testTag("hero_contact_button"),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.outlinedButtonColors(
              contentColor = Color(0xFF38BDF8)
            ),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF38BDF8))
          ) {
            Icon(
              imageVector = Icons.Default.Email,
              contentDescription = null,
              modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
              text = "Contact",
              fontSize = 13.sp,
              fontWeight = FontWeight.SemiBold
            )
          }
        }
      }
    }
  }
}

@Composable
fun HeroStatBadge(
  icon: androidx.compose.ui.graphics.vector.ImageVector,
  text: String,
  tint: Color
) {
  Surface(
    shape = RoundedCornerShape(8.dp),
    color = Color(0xFF1E293B),
    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF334155)),
    modifier = Modifier.padding(vertical = 4.dp)
  ) {
    Row(
      modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
      verticalAlignment = Alignment.CenterVertically
    ) {
      Icon(
        imageVector = icon,
        contentDescription = null,
        tint = tint,
        modifier = Modifier.size(14.dp)
      )
      Spacer(modifier = Modifier.width(5.dp))
      Text(
        text = text,
        color = Color(0xFFE2E8F0),
        fontSize = 11.5.sp,
        fontWeight = FontWeight.Medium
      )
    }
  }
}
