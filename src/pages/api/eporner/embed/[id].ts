import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  const { id } = params;

  if (!id) {
    return new Response('Video ID required', { status: 400 });
  }

  // Clean video ID if it contains slug or prefix
  const cleanId = id.replace(/^ep-/, '').trim();

  try {
    const upstreamUrl = `https://www.eporner.com/embed/${cleanId}/`;
    const upstreamRes = await fetch(upstreamUrl, {
      headers: {
        'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': upstreamUrl
      }
    });

    if (!upstreamRes.ok) {
      return new Response(`Gagal memuat player video (${upstreamRes.status})`, { status: upstreamRes.status });
    }

    let html = await upstreamRes.text();

    // 1. Inject <base> tag so all relative assets (videojs, fonts, images, css) load from eporner CDN
    // 2. Inject custom CSS to completely hide 'Hosted by EPORNER.COM', download icon, context menu, and external links
    // 3. Inject script to prevent any outbound links or popups to eporner
    const customInjections = `
      <base href="https://www.eporner.com/">
      <style>
        /* Sembunyikan Download Icon di Kiri Atas */
        .vjs-dock-shelf,
        .vjs-dock-icon,
        .vjs-dock-text,
        .vjs-dock-shelf-item,
        .vjs-docker,
        img[src*="download.png"],
        img[src*="download"],
        a[href*="/dload/"],
        a[href*="embed_stat"] {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
          visibility: hidden !important;
          width: 0 !important;
          height: 0 !important;
        }

        /* Sembunyikan 'Hosted by EPORNER.COM' di Kanan Bawah Control Bar */
        .vjs-hostedby,
        .vjs-icon-subtitles.vjs-hostedby,
        .EP-with-embed .vjs-hostedby,
        [class*="hostedby"],
        [class*="hosted-by"],
        [class*="vjs-hostedby"],
        button[title*="eporner" i],
        a[title*="eporner" i] {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
          visibility: hidden !important;
          width: 0 !important;
          height: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        /* Sembunyikan Headbar Title & Link Eporner di Bagian Atas Player */
        #headbar,
        #headlink,
        #moviexxx #headbar {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
          visibility: hidden !important;
          height: 0 !important;
        }

        /* Hilangkan Clickable Background & Dialog yang membuka popup tab Eporner */
        .vjs-text-track-display,
        .vjs-modal-dialog {
          pointer-events: none !important;
        }

        /* Sembunyikan Menu Klik Kanan Bawaan Eporner */
        #playerContextMenu,
        .pCM_about {
          display: none !important;
        }

        /* Pastikan video player full, responsif, dan rapi */
        html, body {
          background-color: #000 !important;
          overflow: hidden !important;
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        #EPvideo {
          width: 100% !important;
          height: 100% !important;
        }
      </style>
      <script>
        // Override EP embed configuration sebelum player di-init
        window.addEventListener('DOMContentLoaded', function() {
          if (window.EP && window.EP.video && window.EP.video.player) {
            window.EP.video.player.embed = false;
            window.EP.video.player.icons = [];
          }
        });

        // Intercept dan blokir seluruh klik yang mencoba membuka eporner.com
        document.addEventListener('click', function(e) {
          const target = e.target;
          if (target) {
            const link = target.tagName === 'A' ? target : target.closest('a');
            if (link && link.href && link.href.includes('eporner.com')) {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }
          }
        }, true);
      </script>
    `;

    // Inject ke dalam <head>
    html = html.replace('<head>', `<head>${customInjections}`);

    // Nonaktifkan flag embed di inline script bawaan
    html = html.replace('EP.video.player.embed = true;', 'EP.video.player.embed = false;');

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'X-Frame-Options': 'ALLOWALL'
      }
    });
  } catch (error: any) {
    console.error('Error proxying clean Eporner embed:', error);
    return new Response(`Error: ${error.message || 'Internal error'}`, { status: 500 });
  }
};
