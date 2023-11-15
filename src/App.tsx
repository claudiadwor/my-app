// import { ReactElement, createElement, useState } from "react";
import { ReactElement, createElement, useState } from "react";
// import { ReactGrid, Column, Row, CellChange, TextCell, Id, MenuOption, SelectionMode } from "@silevis/reactgrid";
import { ReactGrid, Column, Row, CellChange, TextCell, Id, MenuOption, SelectionMode, Highlight, CellLocation } from "@silevis/reactgrid";
import "@silevis/reactgrid/styles.css";
//import { CellStyle } from '@silevis/reactgrid/reactgrid'; //do i need .d or .d.ts at all?

//adding functionality to existing

//import "./ui/RGrid.css";

interface Person {
    id: number;
    name: string;
    surname: string;
}

interface Data {
  id: number;
  col1: string;
  col2: string;
  col3: Date;
}
  
const getPeople = (): Person[] => [
  { id: 1, name: "", surname: "" },
  { id: 2, name: "", surname: "" },
  { id: 3, name: "", surname: "" },
  { id: 4, name: "", surname: "" }
];

const getData = (): Data[] => [
  { id: 1, col1: "", col2: "", col3: new Date() },
  { id: 2, col1: "", col2: "", col3: new Date() },
  { id: 3, col1: "", col2: "", col3: new Date() },
  { id: 4, col1: "", col2: "", col3: new Date() },
  { id: 5, col1: "", col2: "", col3: new Date() },
]

const getHighlight = (): Highlight[] => [
  { columnId: "name", rowId: 0, borderColor: "transparent" },
  { columnId: "name", rowId: 1, borderColor: "transparent" },
  { columnId: "name", rowId: 2, borderColor: "transparent" },
  { columnId: "name", rowId: 3, borderColor: "transparent" },
]
const getDataColumns = (): Column[] => [
  { columnId: "col1", width: 150, resizable: true, reorderable: true },
  { columnId: "col2", width: 150, resizable: true, reorderable: true },
  { columnId: "col3", width: 150, resizable: true, reorderable: true }
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
      { type: "date", text: data.col3 },
    ]
  }))
];

const applyHighlights = (
  changes: Highlight[],
  _prevHighlight?: Highlight[]
): Highlight[] => {
  return changes
}

const applyChangesToData = (
  changes: CellChange<TextCell>[],
  prevData: Data[]
): Data[] => {
  changes.forEach((change) => {
    const index =  change.rowId as Number;
    const fieldName = change.columnId;
    // @ts-ignore 
    prevData[index][fieldName] = change.newCell.text;
  });
  return [...prevData];
};

export default function RGrid(): ReactElement {
    const [data, setData] = useState<Data[]>(getData);
    const rows = getDataRows(data);

    const [highlights, setHighlight] = useState<Highlight[]>(getHighlight())
    
    const [columns, setColumns] = useState<Column[]>(getDataColumns());
    
    const handleChanges = (changes: CellChange<TextCell>[]) => { 
      setData((prevData) => applyChangesToData(changes, prevData));
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

    // const handleRowsReorder = (targetRowId: Id, rowIds: Id[]) => {
    //     setData((prevPeople) => {
    //         const to = people.findIndex(person => person.id === targetRowId);
    //         const rowsIds = rowIds.map((id) => people.findIndex(person => person.id === id));
    //         return reorderArray(prevPeople, rowsIds, to);
    //     });
    // }
  
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
              columnId: "col1", //selectedColIds[0],
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
        handler: () => {console.log("add functionality to add column")}
        // handler: () => {
        //   const newCol: Data = {number: 24};
        //   return [...Data, newCol]
        //   }
      },
      {
        id: "addRow",
        label: "Add row",
        handler: () => {
          setData(prevData => {
            //todo: last row menu options don't have remove row and add row option
            const newData: Data = {
              id: prevData.length, //maybe + 1
              col1: 'new row value',
              col2: 'new row value',
              col3: new Date(22),
            };
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
    
    //returned component
    return (
        <ReactGrid
            rows={rows} 
            columns={columns} 
            // @ts-ignore
            onCellsChanged={(changes) => handleChanges(changes)}
            onContextMenu={handleContextMenu} //causing remove child error too but functionality still works
            onColumnResized={handleColumnResize}
            onColumnsReordered={handleColumnsReorder}
            //onRowsReordered={handleRowsReorder}
            enableFillHandle
            enableRangeSelection //todo: causing the child node error on mendix side after trying to select things
            enableRowSelection
            enableColumnSelection
            
            highlights={highlights} //todo: make highlight an option in context menu that you can choose color for
            //onHighlightsChanged={handleHighlights}
        />
    );
}
