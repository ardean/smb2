declare enum HeaderFlag {
    Response = 1,
    Async = 2,
    Chained = 4,
    Signed = 8,
    Priority = 16,
    DfsOperation = 32,
    ReplayOperation = 64
}
export default HeaderFlag;
