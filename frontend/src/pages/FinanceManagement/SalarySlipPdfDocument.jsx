import React from "react";
import {
	Document,
	Page,
	Text,
	View,
	StyleSheet,
	Font,
} from "@react-pdf/renderer";

Font.register({
	family: "Helvetica",
	src: "https://fonts.gstatic.com/s/helvetica/v6/ARIAL.TTF",
});

const styles = StyleSheet.create({
	page: {
		padding: 30,
		fontFamily: "Helvetica",
		fontSize: 10,
		lineHeight: 1.5,
		backgroundColor: "#f9fafb",
	},
	headerContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		paddingBottom: 10,
		borderBottomWidth: "2pt",
		borderBottomColor: "#c62828",
		marginBottom: 15,
	},
	companyInfo: {
		width: "60%",
	},
	companyTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#c62828",
	},
	contactText: {
		fontSize: 8,
		color: "#555",
		marginTop: 2,
	},
	title: {
		fontSize: 20,
		textAlign: "center",
		fontWeight: "bold",
		color: "#c62828",
		marginBottom: 15,
		marginTop: 10,
	},
	detailSection: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginBottom: 10,
		borderWidth: "1pt",
		borderColor: "#ccc",
		padding: 5,
	},
	detailItem: {
		flexDirection: "row",
		width: "50%",
		paddingVertical: 3,
	},
	detailLabel: {
		fontWeight: "bold",
		width: "40%",
	},
	detailValue: {
		width: "60%",
	},
	table: {
		display: "table",
		width: "auto",
		borderStyle: "solid",
		borderWidth: "1pt",
		borderColor: "#000",
		borderRightWidth: 0,
		borderBottomWidth: 0,
		marginTop: 15,
	},
	tableRow: {
		flexDirection: "row",
	},
	tableHeader: {
		backgroundColor: "#f3f4f6",
		fontWeight: "bold",
	},
	tableCellDesc: {
		width: "60%",
		padding: 6,
		borderStyle: "solid",
		borderColor: "#000",
		borderBottomWidth: "1pt",
		borderRightWidth: "1pt",
		fontWeight: "bold",
	},
	tableCellAmount: {
		width: "20%",
		padding: 6,
		borderStyle: "solid",
		borderColor: "#000",
		borderBottomWidth: "1pt",
		borderRightWidth: "1pt",
		textAlign: "right",
	},
	totalRow: {
		backgroundColor: "#e0e0e0",
		fontWeight: "bold",
	},
	netPayContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 20,
		borderTopWidth: "1pt",
		borderTopColor: "#000",
		paddingTop: 10,
	},
	netPayLabel: {
		fontSize: 12,
		fontWeight: "bold",
		width: "70%",
	},
	netPayAmount: {
		fontSize: 14,
		fontWeight: "bold",
		color: "#c62828",
		width: "30%",
		textAlign: "right",
	},
	footerSection: {
		marginTop: 50,
	},
	signature: {
		width: 150,
		borderTopWidth: "1pt",
		borderTopColor: "#000",
		paddingTop: 5,
		marginTop: 40,
	},
});

const formatDate = (dateString) => {
	try {
		return new Date(dateString).toLocaleDateString("en-GB");
	} catch {
		return "N/A";
	}
};

const formatLKR = (amount) => {
	if (typeof amount !== "number") return "LKR 0.00";
	return amount.toLocaleString("en-IN", {
		style: "currency",
		currency: "LKR",
		minimumFractionDigits: 2,
	});
};

export const SalarySlipPdfDocument = ({ slipData }) => {
	const {
		employeeName,
		role,
		totalWorkingDays,
		daysPresent,
		basicSalary,
		perDaySalary,
		otHours,
		otPay,
		mealAllowance,
		transportAllowance,
		medicalAllowance,
		noPayLeaves,
		epfAmount,
		finalSalary,
		createdAt,
	} = slipData;

	const dateIssued = formatDate(new Date());
	const payMonth = formatDate(createdAt);
	const position = role;
	const employeeID = slipData._id.substring(0, 10);

	const noPayDeduction = noPayLeaves * perDaySalary;
	const grossEarnings =
		basicSalary + mealAllowance + transportAllowance + medicalAllowance + otPay;
	const taxDeduction = grossEarnings * (slipData.taxRate / 100);
	const totalDeductions = noPayDeduction + epfAmount + taxDeduction;

	const tableData = [
		{ desc: "Basic Salary", earnings: basicSalary, deduction: 0 },
		{ desc: "Meal Allowance", earnings: mealAllowance, deduction: 0 },
		{
			desc: "Transportation Allowance",
			earnings: transportAllowance,
			deduction: 0,
		},
		{ desc: "Medical Allowance", earnings: medicalAllowance, deduction: 0 },
		{ desc: `OT Pay (${otHours} Hrs)`, earnings: otPay, deduction: 0 },
		{ desc: "No Pay Leaves", earnings: 0, deduction: noPayDeduction },
		{ desc: "EPF", earnings: 0, deduction: epfAmount },
		{
			desc: `Tax (${slipData.taxRate}%)`,
			earnings: 0,
			deduction: taxDeduction,
		},
	];

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<View style={styles.headerContainer} fixed>
					<View style={styles.companyInfo}>
						<Text style={styles.companyTitle}>FireLink SL</Text>
						<Text style={styles.contactText}>
							Main Fire Station (Head Quarters), T.B. Jaya Mawatha
						</Text>
						<Text style={styles.contactText}>Colombo 10, Sri Lanka.</Text>
						<Text style={styles.contactText}>Contact: (+94) 11-1234567</Text>
					</View>
					<View style={styles.generatedInfo}>
						<Text style={styles.contactText}>Generated on: {dateIssued}</Text>
					</View>
				</View>

				<Text style={styles.title}>SALARY SLIP</Text>

				<View style={styles.detailSection}>
					<View style={styles.detailItem}>
						<Text style={styles.detailLabel}>Name :</Text>
						<Text style={styles.detailValue}>{employeeName}</Text>
					</View>
					<View style={styles.detailItem}>
						<Text style={styles.detailLabel}>Employee ID :</Text>
						<Text style={styles.detailValue}>{employeeID}</Text>
					</View>
					<View style={styles.detailItem}>
						<Text style={styles.detailLabel}>Position:</Text>
						<Text style={styles.detailValue}>{position}</Text>
					</View>
					<View style={styles.detailItem}>
						<Text style={styles.detailLabel}>Pay Month :</Text>
						<Text style={styles.detailValue}>{payMonth}</Text>
					</View>
					<View style={styles.detailItem}>
						<Text style={styles.detailLabel}>Payment Date :</Text>
						<Text style={styles.detailValue}>{dateIssued}</Text>
					</View>
					<View style={styles.detailItem}>
						<Text style={styles.detailLabel}>Days Present:</Text>
						<Text style={styles.detailValue}>
							{daysPresent} / {totalWorkingDays}
						</Text>
					</View>
				</View>

				<View style={styles.table}>
					<View style={[styles.tableRow, styles.tableHeader]} fixed>
						<Text style={styles.tableCellDesc}>Description</Text>
						<Text style={styles.tableCellAmount}>Earnings</Text>
						<Text style={styles.tableCellAmount}>Deductions</Text>
					</View>

					{tableData.map((item, index) => (
						<View key={index} style={styles.tableRow} wrap={false}>
							<Text style={styles.tableCellDesc}>{item.desc}</Text>
							<Text style={styles.tableCellAmount}>
								{formatLKR(item.earnings)}
							</Text>
							<Text style={styles.tableCellAmount}>
								{formatLKR(item.deduction)}
							</Text>
						</View>
					))}

					<View style={[styles.tableRow, styles.totalRow]}>
						<Text style={styles.tableCellDesc}>Total (LKR)</Text>
						<Text style={styles.tableCellAmount}>
							{formatLKR(grossEarnings)}
						</Text>
						<Text style={styles.tableCellAmount}>
							{formatLKR(totalDeductions)}
						</Text>
					</View>
				</View>

				<View style={styles.netPayContainer}>
					<Text style={styles.netPayLabel}>NET PAY (LKR)</Text>
					<Text style={styles.netPayAmount}>{formatLKR(finalSalary)}</Text>
				</View>

				<View style={{ marginTop: 10 }}>
					<Text style={{ fontSize: 9 }}>Payment Date : {dateIssued}</Text>
					<Text style={{ fontSize: 9 }}>Bank Name : Commercial Bank</Text>
				</View>

				<View style={styles.footerSection}>
					<View style={styles.signature}>
						<Text>Signature:-</Text>
					</View>
				</View>

				<Text
					style={{
						position: "absolute",
						bottom: 15,
						left: 30,
						fontSize: 8,
						color: "#888",
					}}
					render={({ pageNumber, totalPages }) =>
						`Page ${pageNumber} of ${totalPages}`
					}
					fixed
				/>
				<Text
					style={{
						position: "absolute",
						bottom: 15,
						right: 30,
						fontSize: 8,
						color: "#888",
					}}
					fixed
				>
					Generated by FireLink SL
				</Text>
			</Page>
		</Document>
	);
};

export default SalarySlipPdfDocument;
