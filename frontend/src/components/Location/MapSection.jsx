import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
	iconUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
	shadowUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export function MapSection({ stations }) {
	const center =
		stations.length > 0
			? [
					stations.reduce((sum, station) => sum + station.coordinates[0], 0) /
						stations.length,
					stations.reduce((sum, station) => sum + station.coordinates[1], 0) /
						stations.length,
			  ]
			: [40.7128, -74.006];
	return (
		<div className="py-12 px-4 md:px-8 bg-gray-100">
			<div className="max-w-7xl mx-auto">
				<h2 className="text-3xl font-bold mb-8 text-center text-navy">
					Interactive Map
				</h2>
				<div className="h-[500px] rounded-lg overflow-hidden shadow-lg">
					<MapContainer
						center={center}
						zoom={8}
						style={{
							height: "100%",
							width: "100%",
						}}
					>
						<TileLayer
							attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						/>
						{stations.map((station) => (
							<Marker key={station.id} position={station.coordinates}>
								<Popup>
									<div>
										<h3 className="font-bold text-fire">{station.name}</h3>
										<p className="text-sm">{station.address}</p>
										<p className="text-sm">{station.phone}</p>
									</div>
								</Popup>
							</Marker>
						))}
					</MapContainer>
				</div>
			</div>
		</div>
	);
}
