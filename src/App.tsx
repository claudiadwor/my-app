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
  
const getPeople = (): Person[] => [
  { id: 1, name: "", surname: "" },
  { id: 2, name: "", surname: "" },
  { id: 3, name: "", surname: "" },
  { id: 4, name: "", surname: "" }
];

const getHighlight = (): Highlight[] => [
  { columnId: "name", rowId: 0, borderColor: "transparent" },
  { columnId: "name", rowId: 1, borderColor: "transparent" },
  { columnId: "name", rowId: 2, borderColor: "transparent" },
  { columnId: "name", rowId: 3, borderColor: "transparent" },
]

const getColumns = (): Column[] => [
  { columnId: "name", width: 150, resizable: true, reorderable: true },
  { columnId: "surname", width: 150, resizable: true, reorderable: true }
];

// header defined here
const headerRow: Row = {
  rowId: "header",
  cells: [
    { type: "header", text: "Name" },
    { type: "header", text: "Surname" }
  ]
};

const getRows = (people: Person[]): Row[] => [
  headerRow,
  ...people.map<Row>((person, idx) => ({
    rowId: idx,
    reorderable: true,
    cells: [
      { type: "text", text: person.name },
      { type: "text", text: person.surname }
    ]
  }))
];

// const getRows = (people: Person[], columnsOrder: ColumnId[]): Row[] => {
//   return [
//     {
//       rowId: "header",
//       cells: [
//         { type: "header", text: columnMap[columnsOrder[0]] },
//         { type: "header", text: columnMap[columnsOrder[1]] }
//       ]
//     },
//     ...people.map<Row>((person) => ({ //removed idx as param
//       rowId: person.id,
//       reorderable: true,
//       cells: [
//         { type: "text", text: person[columnsOrder[0]] }, // `person['name']` / `person['surname']`
//         { type: "text", text: person[columnsOrder[1]] } // `person['surname']` / `person['name']`
//       ]
//     }))
//   ]
// };

const applyHighlights = (
  changes: Highlight[],
  _prevHighlight?: Highlight[]
): Highlight[] => {
  return changes
}

// const applyChangesToPeople = (
//       changes: CellChange<TextCell>[],
//       prevPeople: Person[]
//   ): Person[] => {
//       //for each person in array of people (each row)
//       changes.forEach((change) => {
//         const personIndex = change.rowId; //rowId where change occurred
//         console.warn("person index: ",personIndex)
//         const fieldName = change.columnId; //columnId where change occurred
//         //@ts.ignore
//         //prevPeople[personIndex][fieldName] = change.newCell.text;
//         console.warn("row changing: ", change.rowId)
//         console.warn("header row: ", headerRow)
//   });
//   return [...prevPeople];
// };

const applyChangesToPeople = (
  changes: CellChange<TextCell>[],
  prevPeople: Person[]
): Person[] => {
  changes.forEach((change) => {
    const personIndex =  change.rowId as Number;
    const fieldName = change.columnId;
    // @ts-ignore 
    prevPeople[personIndex][fieldName] = change.newCell.text;
  });
  return [...prevPeople];
};

export default function RGrid(): ReactElement {
    const [people, setPeople] = useState<Person[]>(getPeople()); //[var, updateVarFunction] = useState(initital_state)
    const rows = getRows(people);

    //todo: how does Highlight[] work here?
    const [highlights, setHighlight] = useState<Highlight[]>(getHighlight())
    
    // const columns = getColumns()
    const [columns, setColumns] = useState<Column[]>(getColumns());
    //removes previous ppl and adding changes, converting it to cell change object
    const handleChanges = (changes: CellChange<TextCell>[]) => { 
        setPeople((prevPeople) => applyChangesToPeople(changes, prevPeople));
    };

    // const handleHighlights = (changes: Highlight[]) => {
    //     setHighlight((prevHighlight) => applyHighlights(changes, prevHighlight)) //only highlighting new cell for now and can go back and add functionality
    // }

    // const rows = getRows(people, columns.map(c => c.columnId as ColumnId));

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

    const handleRowsReorder = (targetRowId: Id, rowIds: Id[]) => {
        setPeople((prevPeople) => {
            const to = people.findIndex(person => person.id === targetRowId);
            const rowsIds = rowIds.map((id) => people.findIndex(person => person.id === id));
            return reorderArray(prevPeople, rowsIds, to);
        });
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
              columnId: "name", //selectedColIds[0],
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
        id: "removeRow",
        label: "Remove row",
        handler: () => {
          setPeople(prevPeople => {
            console.log("row ids in remove row",selectedRowIds)
            return prevPeople.filter((_person, idx) => !selectedRowIds.includes(idx))
          })
        }
      },
      {
        id: "addRow",
        label: "Add row",
        handler: () => {
          setPeople(prevPeople => {
            //todo: last row menu options don't have remove row and add row option
            const newPerson: Person = {
              id: prevPeople.length, //maybe + 1
              name: '',
              surname: ''
            };
            return [...prevPeople, newPerson]
          })
        }
      },
      {
        id: "addCol",
        label: "Add column",
        handler: () => {
          setPeople(prevPeople => {
            //todo: last row menu options don't have remove row and add row option
            const newPerson: Person = {
              id: prevPeople.length, //maybe + 1
              name: '',
              surname: ''
            };
            return [...prevPeople, newPerson]
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
            onRowsReordered={handleRowsReorder}
            enableFillHandle
            enableRangeSelection //todo: causing the child node error on mendix side after trying to select things
            enableRowSelection
            enableColumnSelection
            
            highlights={highlights} //todo: make highlight an option in context menu that you can choose color for
            //onHighlightsChanged={handleHighlights}
        />
    );
}
