# InsightClass Design System Guide

## 1. Semantic Color Tokens

| Token | Light Mode (Hex) | Dark Mode (Hex) | Purpose |
| :--- | :--- | :--- | :--- |
| **App Background** | `#F8FAFC` | `#0F172A` | Main application canvas |
| **Card Background** | `#FFFFFF` | `#1E293B` | Surfaces for content blocks |
| **Sidebar Background**| `#F1F5F9` | `#1E293B` | Navigation and secondary actions |
| **Primary Text** | `#0F172A` | `#E2E8F0` | Main headings and content |
| **Secondary Text** | `#64748B` | `#94A3B8` | Descriptive text and labels |
| **Border / Divider** | `#E2E8F0` | `#334155` | Structural separation |
| **Interactive (AI)** | `#7C3AED` | `#A78BFA` | Primary AI-driven actions |

## 2. Risk Status Badge Mapping

The risk indicators use a "Muted & Respectful" approach to avoid alarmist UI.

### Light Mode
- **Stable**: 
  - Bg: `#F0FDFA` (Soft Teal)
  - Text: `#134E4A` (Deep Teal)
  - Border: `#99F6E4`
- **Needs Attention**:
  - Bg: `#FFFBEB` (Soft Amber)
  - Text: `#78350F` (Deep Amber)
  - Border: `#FDE68A`
- **High Risk**:
  - Bg: `#FFF1F2` (Muted Rose)
  - Text: `#881337` (Deep Rose)
  - Border: `#FECDD3`

### Dark Mode (Desaturated)
- **Stable**:
  - Bg: `rgba(20, 184, 166, 0.1)`
  - Text: `#5EEAD4`
  - Border: `rgba(94, 234, 212, 0.2)`
- **Needs Attention**:
  - Bg: `rgba(245, 158, 11, 0.1)`
  - Text: `#FCD34D`
  - Border: `rgba(252, 211, 77, 0.2)`
- **High Risk**:
  - Bg: `rgba(244, 63, 94, 0.1)`
  - Text: `#FDA4AF`
  - Border: `rgba(253, 164, 175, 0.2)`

## 3. Component Application Examples

### Students Table
- **Hover States**: In Light Mode, rows use a subtle `#F1F5F9` (Slate 100) on hover. In Dark Mode, they use a dim `#334155` (Slate 700) with 50% opacity to maintain focus without harsh contrast.
- **Risk Badges**: Badges use semi-transparent backgrounds in Dark Mode to blend with the deep surface, ensuring they don't look like "neon" warnings.

### AI Copilot Modal
- **Separation**: The modal uses a slightly lighter surface color (`bg-card`) than the main app background in Dark Mode, combined with a pronounced shadow and a subtle border ring (`ring-1 ring-border/50`) to create elevation and depth.

## 4. Tailwind Configuration Snippet

In Tailwind v4, variables are defined in the `@theme` block in `index.css`:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-primary: var(--primary);
  --color-sidebar: var(--sidebar);
  /* ... status colors ... */
  --color-status-stable-bg: var(--status-stable-bg);
  --color-status-stable-text: var(--status-stable-text);
  --color-status-attention-bg: var(--status-attention-bg);
  /* etc. */
}
```
