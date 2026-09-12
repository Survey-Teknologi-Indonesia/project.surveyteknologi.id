"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle, MapPin, ExternalLink, FileText, Image as ImageIcon } from "lucide-react";
import { kml } from "@tmcw/togeojson";
import JSZip from "jszip";
import type { DriveFileItem } from "@/app/dashboard/[id]/flight-plan/actions";

interface KmlMapViewerProps {
  file: DriveFileItem | null;
}

export default function KmlMapViewer({ file }: KmlMapViewerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref container & instansi peta Leaflet
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  const ext = file?.extension?.toUpperCase() || "";
  const isKmlOrKmz = ext === "KML" || ext === "KMZ";
  const isImage =
    file?.isImage ||
    ["JPG", "JPEG", "PNG", "WEBP", "TIFF", "TIF", "DNG"].includes(ext);

  useEffect(() => {
    let isCancelled = false;

    // Bersihkan peta sebelumnya
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    if (!file) {
      setLoading(false);
      setError(null);
      return;
    }

    // Hanya inisialisasi peta Leaflet untuk berkas KML atau KMZ
    if (!isKmlOrKmz) {
      setLoading(false);
      setError(null);
      return;
    }

    async function initMap() {
      try {
        setLoading(true);
        setError(null);

        // 1. Import Leaflet dinamis
        const L = (await import("leaflet")).default;
        await import("leaflet/dist/leaflet.css");

        if (isCancelled) return;

        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        });

        // 2. Fetch data via API Proxy
        const proxyUrl = `/api/kml-proxy?fileId=${file!.id}`;
        const res = await fetch(proxyUrl);

        if (isCancelled) return;

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Gagal mengambil data KML dari Google Drive.");
        }

        let xmlText = "";

        if (ext === "KMZ") {
          const blob = await res.blob();
          if (isCancelled) return;
          const zip = await JSZip.loadAsync(blob);
          const kmlFileInZip = Object.keys(zip.files).find((name) =>
            name.toLowerCase().endsWith(".kml")
          );

          if (!kmlFileInZip) {
            throw new Error("Berkas .kml tidak ditemukan di dalam arsip KMZ.");
          }
          xmlText = await zip.files[kmlFileInZip].async("string");
        } else {
          xmlText = await res.text();
        }

        if (isCancelled) return;

        // 3. Konversi KML -> GeoJSON
        const dom = new DOMParser().parseFromString(xmlText, "text/xml");
        const geojson = kml(dom);

        if (!geojson || !geojson.features || geojson.features.length === 0) {
          throw new Error("Berkas KML/KMZ tidak memiliki objek spasial/geometris yang valid.");
        }

        const containerEl = containerRef.current;
        if (!containerEl || isCancelled) return;

        // 4. Inisialisasi Peta Leaflet
        const map = L.map(containerEl).setView([-0.91, 116.78], 12);
        mapRef.current = map;

        // Tile Satellite Esri World Imagery
        L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution: "Tiles &copy; Esri",
            maxZoom: 19,
          }
        ).addTo(map);

        // 5. Render Layer Spasial
        const geoLayer = L.geoJSON(geojson, {
          style: {
            color: "#38bdf8", // Sky blue kontras tinggi
            weight: 3,
            opacity: 0.95,
            fillColor: "#0284c7",
            fillOpacity: 0.25,
          },
          pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
              radius: 6,
              fillColor: "#fb7185",
              color: "#ffffff",
              weight: 2,
              opacity: 1,
              fillOpacity: 0.9,
            });
          },
          onEachFeature: (feature, layer) => {
            if (feature.properties?.name || feature.properties?.description) {
              layer.bindPopup(`
                <div class="text-xs font-sans p-1">
                  <strong>${feature.properties.name || "Titik Jalur Terbang"}</strong>
                  ${feature.properties.description ? `<p class="mt-1 text-slate-600">${feature.properties.description}</p>` : ""}
                </div>
              `);
            }
          },
        }).addTo(map);

        // Auto Zoom ke Bounding Box Jalur Terbang
        if (geoLayer.getBounds().isValid()) {
          map.fitBounds(geoLayer.getBounds(), { padding: [40, 40] });
        }

        // Trigger penyesuaian ukuran
        setTimeout(() => {
          if (!isCancelled && mapRef.current) {
            mapRef.current.invalidateSize();
          }
        }, 200);
      } catch (err: any) {
        if (!isCancelled) {
          console.error("Gagal memproses KML:", err);
          setError(err.message || "Gagal memproses berkas peta spasial.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    initMap();

    return () => {
      isCancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [file, ext, isKmlOrKmz]);

  return (
    <div className="relative w-full h-[450px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 bg-slate-900/85 backdrop-blur-xs flex flex-col items-center justify-center text-slate-300 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-[#38bdf8]" />
          <span className="text-xs font-semibold">Memuat peta spasial: {file?.name}...</span>
        </div>
      )}

      {/* Error View */}
      {error ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-900">
          <AlertCircle className="w-8 h-8 text-rose-400 mb-2" />
          <p className="text-xs font-bold text-slate-200 max-w-md">{error}</p>
          {file && (
            <a
              href={file.webViewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka langsung di Google Drive</span>
            </a>
          )}
        </div>
      ) : !file ? (
        /* Empty State */
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-6 text-center">
          <MapPin className="w-10 h-10 mb-2 text-slate-600" />
          <p className="text-xs font-semibold text-slate-400">
            Pilih berkas dari tabel di bawah untuk menampilkan preview jalur terbang di peta.
          </p>
        </div>
      ) : isImage ? (
        /* Image Preview View */
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/kml-proxy?fileId=${file.id}`}
            alt={file.name}
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            onError={(e) => {
              if (file.thumbnailLink) {
                (e.target as HTMLImageElement).src = file.thumbnailLink.replace(/=s\d+/, "=s1200");
              }
            }}
          />
        </div>
      ) : !isKmlOrKmz ? (
        /* Non-KML Non-Image Fallback View */
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-6 bg-slate-900">
          <FileText className="w-12 h-12 text-slate-600 mb-3" />
          <p className="text-sm font-bold text-slate-200">{file.name}</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Berkas ini berformat <span className="font-mono font-bold text-amber-400">.{file.extension}</span>. Peta interaktif Leaflet dirancang untuk berkas spasial <span className="font-mono font-bold text-sky-400">.KML</span> atau <span className="font-mono font-bold text-sky-400">.KMZ</span>.
          </p>
          <a
            href={file.webViewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#004b87] hover:bg-[#003763] text-white text-xs font-bold rounded-xl transition-all shadow-md"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Buka Berkas di Google Drive</span>
          </a>
        </div>
      ) : null}

      {/* Container utama elemen DOM Peta Leaflet */}
      <div
        ref={containerRef}
        id="kml-map-viewer-container"
        className={`w-full h-full z-0 ${!isKmlOrKmz ? "invisible" : ""}`}
      />
    </div>
  );
}