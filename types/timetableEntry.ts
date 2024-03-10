type RoomWithTimetable = {
    room: Room;
    timetable: TimetableEntry[];
};

interface TimetableEntry {
    topIdx: number;
    slotInDay: number;
    time: string;
    module: string;
    lecturer: string;
    group: string;
    roomName: string;
    day: string;
    startDateString: string;
    endDateString: string;
}

interface Room {
    buildingCode: BuildingCode;
    name: string;
    url: string;
}

type BuildingCode =
    | "AB"
    | "AL"
    | "BB"
    | "CB"
    | "CM"
    | "DB"
    | "ER"
    | "EB"
    | "EIC"
    | "FB"
    | "GR"
    | "HR"
    | "HA"
    | "HB"
    | "KM"
    | "LE"
    | "LH"
    | "MB"
    | "ME"
    | "SU"
    | "VE"
    | "VB"
    | "WB"
    | "33ES"
    | "LIB"
    | "53";
