#!/usr/bin/env bash
# เตรียม OSM vector tiles ประเทศไทยสำหรับ tileserver-gl (profile: tiles)
# production ห้ามใช้ tile.openstreetmap.org — ผิด OSMF usage policy
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p data

echo "==> ดาวน์โหลด Thailand OSM extract (Geofabrik)"
curl -L -o data/thailand-latest.osm.pbf \
  https://download.geofabrik.de/asia/thailand-latest.osm.pbf

echo "==> แปลงเป็น MBTiles ด้วย tilemaker (ผ่าน docker)"
docker run --rm -v "$(pwd)/data:/data" ghcr.io/systemed/tilemaker:master \
  /data/thailand-latest.osm.pbf --output /data/thailand.mbtiles

cat > data/config.json <<'EOF'
{
  "options": { "paths": { "mbtiles": "/data" } },
  "data": { "thailand": { "mbtiles": "thailand.mbtiles" } }
}
EOF

echo "==> เสร็จ — เปิดใช้ด้วย: docker compose --profile tiles up -d tileserver"
echo "    แล้วตั้ง TILE_URL=https://<host>/tiles/data/thailand/{z}/{x}/{y}.pbf ใน .env"
