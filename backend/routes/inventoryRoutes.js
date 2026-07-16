const express = require("express");
const router = express.Router();
const {
	createItem,
	getItems,
	getItemById,
	updateItem,
	deleteItem,
	generateReport,
	checkItemIdExists,
	addItemQuantity,
	removeItemQuantity,
	getItemsForMissions,
	getItemByItemId,
} = require("../controllers/inventoryController");

// Import middleware
const { protect } = require("../middlewares/authMiddleware");
const { authorizePositions } = require("../middlewares/roleMiddleware");

// Position groups behind each endpoint, per the @access notes below. Spelling
// follows the Add Staff form (frontend AddUsers.jsx); authorizePositions
// normalises spacing/underscores, so "chief officer" also matches "chiefofficer".
// Note there is no "admin" position in this system — the Chief Fire Officer is
// the top-level role.
const CHIEF = "chief officer";
const CAN_VIEW_INVENTORY = [
	"inventorymanager",
	CHIEF,
	"1stclassofficer",
	"recordmanager",
	"supply_manager",
];
const CAN_EDIT_INVENTORY = ["inventorymanager", CHIEF];
const CAN_VIEW_REPORTS = ["inventorymanager", "financemanager", CHIEF];
const CAN_USE_MISSION_ITEMS = ["recordmanager", "inventorymanager", CHIEF];
const CAN_DELETE_INVENTORY = [CHIEF];

// Import validation
const { validateInventoryItem } = require("../validators/inventoryValidator");

// @route   POST /api/inventory
// @desc    Create new inventory item
// @access  Private - Inventory Manager, Admin, CFO

// 7.Route definition with middleware chain:
router.post(
	"/",
	protect,						//8.verify JWT token
	authorizePositions(CAN_EDIT_INVENTORY),	//9.Check user position
	validateInventoryItem,		//10.validate input data
	createItem			        //11.execute controller function to create item	--> LOOK inventoryController.js
);

// @route   GET /api/inventory
// @desc    Get all inventory items with search/filter
// @access  Private - Anyone with inventory access
router.get(
	"/",
	protect,	//verify JWT token
	authorizePositions(CAN_VIEW_INVENTORY),	//Check user position
	getItems //execute controller function to get items --> LOOK inventoryController.js
);

// @route   GET /api/inventory/check-id/:itemId
// @desc    Check if item ID exists
// @access  Private - Anyone with inventory access
router.get(
	"/check-id/:itemId",
	protect,
	authorizePositions(CAN_VIEW_INVENTORY),
	checkItemIdExists
);

// @route   GET /api/inventory/reports
// @desc    Generate inventory reports
// @access  Private - Inventory Manager, Finance Manager, Admin, CFO
router.get(
	"/reports",
	protect,
	authorizePositions(CAN_VIEW_REPORTS),
	generateReport
);

// Mission Records Integration Routes (MUST be before /:id route)
// @route   GET /api/inventory/items-for-missions
// @desc    Get available inventory items for mission records
// @access  Private - Record Managers
router.get(
	"/items-for-missions",
	protect,
	authorizePositions(CAN_USE_MISSION_ITEMS),
	getItemsForMissions
);

// @route   GET /api/inventory/by-item-id/:itemId
// @desc    Get single item by item_ID for validation
// @access  Private - Record Managers
router.get(
	"/by-item-id/:itemId",
	protect,
	authorizePositions(CAN_USE_MISSION_ITEMS),
	getItemByItemId
);

// @route   GET /api/inventory/:id
// @desc    Get single inventory item by ID
// @access  Private - Anyone with inventory access
router.get(//update 6: route processes GET request
	"/:id",
	protect,
	authorizePositions(CAN_VIEW_INVENTORY),
	getItemById // update 7: Calls inventoryController.js getItemById function which fetches item data from database
);

// @route   PUT /api/inventory/:id
// @desc    Update inventory item
// @access  Private - Inventory Manager, Admin
router.put(
	"/:id",						//update 15: route processes PUT request to update item by ID
	protect,			//verify JWT token
	authorizePositions(CAN_EDIT_INVENTORY),	//Check user position
	validateInventoryItem,		//validate input data
	updateItem		        //execute controller function to update item --> LOOK inventoryController.js
);

// @route   DELETE /api/inventory/:id
// @desc    Delete inventory item
// @access  Private - Chief Officer only
router.delete(
	"/:id",
	protect,
	authorizePositions(CAN_DELETE_INVENTORY),
	deleteItem
);

// @route   POST /api/inventory/:id/add-quantity
// @desc    Add quantity to inventory item (Quick Adjust)
// @access  Private - Inventory Manager, Admin
router.post(
	"/:id/add-quantity",
	protect,
	authorizePositions(CAN_EDIT_INVENTORY),
	addItemQuantity
);

// @route   POST /api/inventory/:id/remove-quantity
// @desc    Remove quantity from inventory item (Quick Adjust)
// @access  Private - Inventory Manager, Admin
router.post(
	"/:id/remove-quantity",
	protect,
	authorizePositions(CAN_EDIT_INVENTORY),
	removeItemQuantity
);

module.exports = router;
