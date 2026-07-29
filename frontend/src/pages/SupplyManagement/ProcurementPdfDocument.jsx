import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
	page: {
		fontFamily: "Helvetica",
		fontSize: 10,
		padding: 20,
		backgroundColor: "#f9fafb",
	},
	header: {
		marginBottom: 15,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingBottom: 10,
		borderBottomWidth: 2,
		borderBottomColor: "#c62828",
	},
	company: { fontSize: 16, fontWeight: "bold", color: "#c62828" },
	contact: { fontSize: 8, color: "#555" },
	title: {
		fontSize: 20,
		textAlign: "center",
		marginVertical: 15,
		fontWeight: "bold",
		color: "#c62828",
	},
	table: { display: "table", width: "auto", marginVertical: 10 },
	tableRow: { flexDirection: "row" },
	tableColHeader: {
		width: "20%",
		padding: 6,
		backgroundColor: "#c62828",
		color: "#fff",
		fontWeight: "bold",
		fontSize: 10,
		textAlign: "center",
	},
	tableCol: {
		width: "20%",
		padding: 6,
		fontSize: 10,
		borderBottomWidth: 0.5,
		borderBottomColor: "#ccc",
	},
	tableRowEven: { backgroundColor: "#f2f2f2" },
	totalRow: {
		marginTop: 10,
		flexDirection: "row",
		justifyContent: "flex-end",
		fontSize: 12,
		fontWeight: "bold",
	},
	footer: { fontSize: 8, textAlign: "center", marginTop: 20, color: "#888" },
});

export const ProcurementPdfDocument = ({ requests }) => {
	const total = requests.reduce((sum, r) => sum + r.price, 0);

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				{/* Header */}
				<View style={styles.header}>
					<View>
						<Text style={styles.company}>FireLink SL</Text>
						<Text style={styles.contact}>
							Main Fire Station, Colombo 10, Sri Lanka
						</Text>
						<Text style={styles.contact}>Contact: (+94) 11-1234567</Text>
					</View>
					<Text style={styles.contact}>
						Generated: {new Date().toISOString().split("T")[0]}
					</Text>
				</View>

				<Text style={styles.title}>PROCUREMENT REPORT</Text>

				{/* Table */}
				<View style={styles.table}>
					{/* Header */}
					<View style={styles.tableRow}>
						<Text style={styles.tableColHeader}>Req. ID</Text>
						<Text style={styles.tableColHeader}>Category</Text>
						<Text style={styles.tableColHeader}>Delivered Date</Text>
						<Text style={styles.tableColHeader}>Supplier</Text>
						<Text style={styles.tableColHeader}>Price (Rs.)</Text>
					</View>

					{/* Data Rows */}
					{requests.map((r, index) => (
						<View
							key={r.id}
							style={[
								styles.tableRow,
								index % 2 === 0 ? styles.tableRowEven : null,
							]}
						>
							<Text style={styles.tableCol}>{r.id}</Text>
							<Text style={styles.tableCol}>{r.category}</Text>
							<Text style={styles.tableCol}>{r.deliveredDate}</Text>
							<Text style={styles.tableCol}>{r.supplierName}</Text>
							<Text style={styles.tableCol}>
								{r.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
							</Text>
						</View>
					))}
				</View>

				{/* Total */}
				<View style={styles.totalRow}>
					<Text>
						Total Spent: Rs.{" "}
						{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
					</Text>
				</View>

				<Text style={styles.footer}>
					Fire Handling System © 2025 | Confidential
				</Text>
			</Page>
		</Document>
	);
};
