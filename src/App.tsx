import { ReactElement, createElement, useState } from "react";
import { ReactGrid, Column, Row, CellChange, TextCell, Id, MenuOption, SelectionMode, Highlight, CellLocation, DefaultCellTypes } from "@silevis/reactgrid";
import "@silevis/reactgrid/styles.css";

interface Data {
  id: number;
  col1: string;
  col2: string;
  col3: string;
}

const getData = (): Data[] => [
  { id: 1, col1: "", col2: "", col3: "" },
  { id: 2, col1: "", col2: "", col3: "" },
  { id: 3, col1: "", col2: "", col3: "" },
  { id: 4, col1: "", col2: "", col3: "" },
  { id: 5, col1: "", col2: "", col3: "" },
]

const getHighlight = (): Highlight[] => [
  { columnId: "name", rowId: 0, borderColor: "transparent" },
  { columnId: "name", rowId: 1, borderColor: "transparent" },
  { columnId: "name", rowId: 2, borderColor: "transparent" },
  { columnId: "name", rowId: 3, borderColor: "transparent" },
]
const getDataColumns = (): Column[] => [
  { columnId: 0, width: 150, resizable: true, reorderable: true },
  { columnId: 1, width: 150, resizable: true, reorderable: true },
  { columnId: 2, width: 150, resizable: true, reorderable: true }
];

// header defined here
const headerRow: Row = {
  rowId: "header",
  cells: [
    { type: "header", text: "Col1" },
    { type: "header", text: "Col2" },
    { type: "header", text: "Col3" },
    //{ type: "header", text: "Col4" }
  ]
};

const getDataRows = (data: Data[]): Row[] => [
  headerRow,
  ...data.map<Row>((data, idx) => ({
    rowId: idx,
    reorderable: true,
    cells: [
      { type: "text", text: data.col1 },
      { type: "text", text: data.col2 },
      { type: "text", text: data.col3 },
    ]
  }))
];

const applyHighlights = (
  changes: Highlight[],
  _prevHighlight?: Highlight[]
): Highlight[] => {
  return changes
}

const applyChangesToRows = (
  changes: CellChange[],
  prevRows: Row[]
): Row[] => {
  const updatedRows = [...prevRows];

  changes.forEach((change) => {
    const rowId = change.rowId as number;
    const colId = change.columnId as number;
    const newCell = change.newCell

    //console.log("change", change) 

    const rowToUpdate = updatedRows.find((row) => row.rowId === rowId);
    //console.log(rowToUpdate)

    if (rowToUpdate) {
      //might need later so keeping it
      const cellToUpdate = rowToUpdate.cells[colId]

      // console.log(cellToUpdate)
      // console.log("updated rows: ",updatedRows)
      // console.log("row being updated", rowToUpdate)
      // console.log("cells in row", updatedRows[rowId].cells[colId])
      
      //@ts-ignore
      updatedRows[rowId+1].cells[colId].text = newCell.text
    }
  });

  return updatedRows;
};

const applyChangesToData = (
  changes: CellChange<TextCell>[],
  prevData: Data[]
): Data[] => {
  changes.forEach((change) => {
    const index =  change.rowId as Number;
    const fieldName = change.columnId;
    console.log("init prev data",prevData)
    // @ts-ignore
    prevData[index][fieldName] = change.newCell.text;
    console.log("new prevData",prevData)
    console.log("apply changes")
    console.log("row changing: ", change.rowId)
    console.log("change:", change)
  });
  return [...prevData];
};

export default function RGrid(): ReactElement {
    const [data, setData] = useState<Data[]>(getData);
    
    const [rows, setRows] = useState<Row[]>(getDataRows(data));

    const [highlights, setHighlight] = useState<Highlight[]>(getHighlight())
    
    const [columns, setColumns] = useState<Column[]>(getDataColumns());
    
    const handleChanges = (changes: CellChange<TextCell>[]) => { 
      console.log("handle cahnges")
      //setData((prevData) => applyChangesToData(changes, prevData));
      // const newData = data[changes[rowId]]
      setRows((prevRows) => applyChangesToRows(changes, prevRows));
    };

    const [headers, setHeaderRow] = useState<Row>(headerRow);

    // const handleHighlights = (changes: Highlight[]) => {
    //     setHighlight((prevHighlight) => applyHighlights(changes, prevHighlight)) //only highlighting new cell for now and can go back and add functionality
    // }

    const reorderArray = <T extends {}>(arr: T[], idxs: number[], to: number) => {
      const movedElements = arr.filter((_, idx) => idxs.includes(idx));
      const targetIdx = Math.min(...idxs) < to ? to += 1 : to -= idxs.filter(idx => idx < to).length;
      const leftSide = arr.filter((_, idx) => idx < targetIdx && !idxs.includes(idx));
      const rightSide = arr.filter((_, idx) => idx >= targetIdx && !idxs.includes(idx));
      return [...leftSide, ...movedElements, ...rightSide];
    }

    const handleColumnsReorder = (targetColumnId: Id, columnIds: Id[]) => {
        const to = columns.findIndex((column) => column.columnId === targetColumnId);
        const columnIdxs = columnIds.map((columnId) => columns.findIndex((c) => c.columnId === columnId));
        setColumns(prevColumns => reorderArray(prevColumns, columnIdxs, to));
    }
  
    const handleContextMenu = (
      selectedRowIds: Id[],
      selectedColIds: Id[],
      _selectionMode: SelectionMode,
      menuOptions: MenuOption[]
    ): MenuOption[] => {
      menuOptions = [
        ...menuOptions,
      //adding highlight as option for any cell
      {
        id: "highlight",
        label: "Add highlight",
        handler: () => {
          const newHighlight: Highlight = {
              columnId: 0, //selectedColIds[0],
              rowId: 1, //selectedRowIds[0], 
              borderColor: "#00ff00"
          };
          return newHighlight
            // const newHighlightsArr = prevHighlights.map((val) => {
            //   if (val.columnId == newHighlight.columnId && val.rowId == newHighlight.rowId) {
            //     return newHighlight
            //   } 
            //   return val;
            // });
            // return newHighlightsArr //[...prevHighlight, newHighlight}]
        }
      },
      {
        //TODO : not working
        id: "removeRow",
        label: "Remove row",
        //TODO: change to setRow
        handler: () => {
          setData(prevData => {
            console.log("row ids in remove row",selectedRowIds)
            return prevData.filter((_, idx) => !selectedRowIds.includes(idx))
          })
        }
      },
      {
        id: "addCol",
        label: "Add column",
        handler: () => {
          //TODO: add new cells where column is created / add empty data
          setColumns(prevColumns => {
            const newCol : Column = { columnId: "col4", width: 150, resizable: true, reorderable: true }
            return [...prevColumns, newCol]
          });
          // setHeaderRow((prevHeaders) : Row => {
          //   const newHeader = {
          //     type: "header", text: "Col4"
          //   };
          //   const updatedHeaders = {
          //     rowId: "header",
          //     cells: [
          //       ...prevHeaders.cells,
          //       newHeader,
          //     ]
          //   };
          //   // @ts-ignore
          //   return updatedHeaders
          //   const headerRow: Row = {
          //     rowId: "header",
          //     cells: [
          //       { type: "header", text: "Col1" },
          //       { type: "header", text: "Col2" },
          //       { type: "header", text: "Col3" },
          //       //{ type: "header", text: "Col4" }
          //     ]
          //   };
          // })
        }
        // handler: () => {
        //   const newCol: Data = {number: 24};
        //   return [...Data, newCol]
        //   }
      },
      {
        id: "addRow",
        label: "Add row",
        handler: () => {
          //TODO: change to setRow
          setData(prevData => {
            //todo: last row menu options don't have remove row and add row option
            const newData: Data = {
              id: prevData.length, //maybe + 1
              col1: 'new row value',
              col2: 'new row value',
              col3: 'new row value',
            };
            //setRows((prevRows) => applyChangesToRows(changes, prevRows))
            // idk if this is necessary^
            return [...prevData, newData]
          })
        }
      }]
      return menuOptions;
    }

    const handleColumnResize = (ci: Id, width: number) => { //Id tells where to move the width of column to
        setColumns((prevColumns) => { //useState hook to update columns variable. so this is function def and call kinda
          // React automatically passes in arg to hook as current state (Column[] in this case) 
          // columnIndex is using findIndex fct to find 

          // el = element in array. iterates through prevColumns to find vals = to ci
          //prevcolumns initiates as getColumns() which includes headers
          const columnIndex = prevColumns.findIndex(el => el.columnId === ci);
          const resizedColumn = prevColumns[columnIndex];
          const updatedColumn = { ...resizedColumn, width };
          prevColumns[columnIndex] = updatedColumn;
          return [...prevColumns];
        });
    }

    const handleUpdateColumns: React.MouseEventHandler<HTMLButtonElement> = (event) => {
      // Logic to update columns based on your requirements
      const newCol = [{columnId : "col4"}]
      //const updatedColumns: YourColumnType[] = /* Update columns here */;
      setColumns(newCol);
      console.log('clicked button')
    };

    // const handleUpdateColumns = (colNames: string, colTypes: DefaultCellTypes) => {
    //   // Logic to update columns based on your requirements
    //   const newCol = [{columnId : "col4"}]
    //   //const updatedColumns = [newcol] : Column[]; /* Update columns here */
    //   console.log("handleUpdateColButton")
    //   setColumns(newCol);
    // };
    
    //returned component
    return (
      <div>
        <button onClick={handleUpdateColumns}>Update Columns</button>
        <ReactGrid
            rows={rows} 
            columns={columns} 
            // @ts-ignore
            onCellsChanged={(changes) => handleChanges(changes)}
            onContextMenu={handleContextMenu} //causing remove child error too but functionality still works
            //onColumnResized={handleColumnResize}
            onColumnsReordered={handleColumnsReorder}
            //onRowsReordered={handleRowsReorder}
            enableFillHandle
            enableRangeSelection //todo: causing the child node error on mendix side after trying to select things
            enableRowSelection
            enableColumnSelection
            
            highlights={highlights} //todo: make highlight an option in context menu that you can choose color for
            //onHighlightsChanged={handleHighlights}
        />
      </div>
    );
}
