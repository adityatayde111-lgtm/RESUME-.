package com.example.ui.components

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.OpenInNew
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.ContactLink
import com.example.data.PortfolioRepository

@Composable
fun ConnectSection(
  modifier: Modifier = Modifier,
  isWideLayout: Boolean = false
) {
  val context = LocalContext.current
  val clipboardManager = LocalClipboardManager.current

  fun handleOpenLink(link: ContactLink) {
    try {
      val intent = if (link.actionUri.startsWith("tel:")) {
        Intent(Intent.ACTION_DIAL, Uri.parse(link.actionUri))
      } else if (link.actionUri.startsWith("mailto:")) {
        Intent(Intent.ACTION_SENDTO, Uri.parse(link.actionUri))
      } else {
        Intent(Intent.ACTION_VIEW, Uri.parse(link.actionUri))
      }
      context.startActivity(intent)
    } catch (e: Exception) {
      Toast.makeText(context, "Could not open: ${link.value}", Toast.LENGTH_SHORT).show()
    }
  }

  fun shareAllContactInfo() {
    try {
      val shareText = buildString {
        appendLine("🎓 Aditya Santosh Tyade - Portfolio & Resume")
        appendLine("Integrated B.Tech in Computer Science & Engineering (CGPA: 8.0)")
        appendLine("Sanjivani University")
        appendLine()
        appendLine("📱 Phone: +91 9403206007")
        appendLine("✉️ Email: adityatayde111@gmail.com")
        appendLine("🔗 LinkedIn: https://linkedin.com/in/aditya-tayde-02a030383")
        appendLine("💻 GitHub: https://github.com/adityatayde111-lgtm")
        appendLine("👨💻 Google Devs: https://me.developers.google.com/u/101792320153173175016")
        appendLine("🏅 Credly: https://Inkd.in/gTUQ98dp")
        appendLine("📷 Instagram: https://www.instagram.com/aditya_tayde_96?stkn=eTZla3JjN29rdWVq")
      }
      val intent = Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_SUBJECT, "Aditya Santosh Tyade - Portfolio & Contact")
        putExtra(Intent.EXTRA_TEXT, shareText)
      }
      context.startActivity(Intent.createChooser(intent, "Share Aditya's Contact Info"))
    } catch (e: Exception) {
      Toast.makeText(context, "Share failed", Toast.LENGTH_SHORT).show()
    }
  }

  Card(
    modifier = modifier
      .fillMaxWidth()
      .testTag("connect_section_card"),
    shape = RoundedCornerShape(20.dp),
    colors = CardDefaults.cardColors(
      containerColor = Color(0xFF111827)
    ),
    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1E293B))
  ) {
    Column(modifier = Modifier.padding(20.dp)) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Column {
          Text(
            text = "Let's Connect",
            color = Color.White,
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold
          )
          Text(
            text = "Tap to call, email, or view verified profiles",
            color = Color(0xFF94A3B8),
            fontSize = 12.sp
          )
        }

        IconButton(
          onClick = { shareAllContactInfo() },
          modifier = Modifier
            .size(40.dp)
            .clip(CircleShape)
            .background(Color(0xFF1E293B))
            .testTag("share_contact_button")
        ) {
          Icon(
            imageVector = Icons.Default.Share,
            contentDescription = "Share Contact Card",
            tint = Color(0xFF38BDF8),
            modifier = Modifier.size(20.dp)
          )
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Responsive Grid of Contact Links
      val links = PortfolioRepository.contactLinks

      if (isWideLayout) {
        // 2-column layout for wide screens
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
          for (i in links.indices step 2) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
              ContactLinkTile(
                link = links[i],
                onOpen = { handleOpenLink(links[i]) },
                onCopy = {
                  clipboardManager.setText(AnnotatedString(links[i].actionUri.removePrefix("tel:").removePrefix("mailto:")))
                  Toast.makeText(context, "Copied ${links[i].title} to clipboard", Toast.LENGTH_SHORT).show()
                },
                modifier = Modifier.weight(1f)
              )
              if (i + 1 < links.size) {
                ContactLinkTile(
                  link = links[i + 1],
                  onOpen = { handleOpenLink(links[i + 1]) },
                  onCopy = {
                    clipboardManager.setText(AnnotatedString(links[i + 1].actionUri.removePrefix("tel:").removePrefix("mailto:")))
                    Toast.makeText(context, "Copied ${links[i + 1].title} to clipboard", Toast.LENGTH_SHORT).show()
                  },
                  modifier = Modifier.weight(1f)
                )
              } else {
                Spacer(modifier = Modifier.weight(1f))
              }
            }
          }
        }
      } else {
        // Single column list on compact devices
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
          links.forEach { link ->
            ContactLinkTile(
              link = link,
              onOpen = { handleOpenLink(link) },
              onCopy = {
                clipboardManager.setText(AnnotatedString(link.actionUri.removePrefix("tel:").removePrefix("mailto:")))
                Toast.makeText(context, "Copied ${link.title} to clipboard", Toast.LENGTH_SHORT).show()
              }
            )
          }
        }
      }
    }
  }
}

@Composable
fun ContactLinkTile(
  link: ContactLink,
  onOpen: () -> Unit,
  onCopy: () -> Unit,
  modifier: Modifier = Modifier
) {
  Surface(
    modifier = modifier
      .fillMaxWidth()
      .clip(RoundedCornerShape(12.dp))
      .clickable { onOpen() }
      .testTag("contact_tile_${link.title.lowercase()}"),
    shape = RoundedCornerShape(12.dp),
    color = Color(0xFF162032),
    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF1F2E47))
  ) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 14.dp, vertical = 12.dp),
      verticalAlignment = Alignment.CenterVertically
    ) {
      Text(
        text = link.iconEmoji,
        fontSize = 20.sp,
        modifier = Modifier.padding(end = 12.dp)
      )

      Column(modifier = Modifier.weight(1f)) {
        Text(
          text = link.title,
          color = Color(0xFF94A3B8),
          fontSize = 11.sp,
          fontWeight = FontWeight.Medium
        )
        Text(
          text = link.value,
          color = Color.White,
          fontSize = 13.5.sp,
          fontWeight = FontWeight.SemiBold,
          maxLines = 1
        )
      }

      IconButton(
        onClick = onCopy,
        modifier = Modifier.size(36.dp)
      ) {
        Icon(
          imageVector = Icons.Default.ContentCopy,
          contentDescription = "Copy",
          tint = Color(0xFF64748B),
          modifier = Modifier.size(16.dp)
        )
      }

      Icon(
        imageVector = Icons.Default.OpenInNew,
        contentDescription = "Open",
        tint = Color(0xFF38BDF8),
        modifier = Modifier.size(18.dp)
      )
    }
  }
}
