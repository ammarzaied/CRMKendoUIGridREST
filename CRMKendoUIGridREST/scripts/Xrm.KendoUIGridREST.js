//Remember everything needs to get uploaded to CRM as web resources to work

Xrm = window.Xrm || { __namespace: true };
Xrm.KendoUIGridREST = Xrm.KendoUIGridREST || { __namespace: true };

$(document).ready(function () {
    Xrm.KendoUIGridREST.CreateGrid();
});

Xrm.KendoUIGridREST.GetAccounts = function () {
    /// <summary>
    /// Executes the REST request to retrieve accounts from Dynamics CRM.
    /// </summary>
    /// <returns type="Object">JSON data consisting of results and total.</returns>

    var response = {};
    response.data = {};
    response.data.results = [];

    //Create the RetrieveMultiple REST request
    var req = new XMLHttpRequest();
    req.open("GET", encodeURI(Xrm.Page.context.getClientUrl() +
        "/XRMServices/2011/OrganizationData.svc/AccountSet?$select=AccountId,AccountNumber,Name&" +
        "$filter=StatusCode/Value eq 1&$orderby=Name asc"), false);
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            req.onreadystatechange = null;
            if (this.status === 200) {
                var returned = JSON.parse(req.responseText).d;
                response.data.results = returned.results;
            }
        }
    };
    req.send();

    return response;
};

Xrm.KendoUIGridREST.CreateGrid = function () {
    /// <summary>
    /// Generates the Kendo UI grid based on the retrieved accounts.
    /// </summary>

    $("#AccountsGrid").kendoGrid({
        dataSource: {
            transport: {
                read: function (options) {
                    var results = Xrm.KendoUIGridREST.GetAccounts();
                    options.success(results);
                }
            },
            schema: {
                data: "data.results",
                total: function (results) {
                    return results.data.results.length;
                }
            },
            pageSize: 10
        },
        height: 335,
        selectable: 'row',
        change: function (arg) {
            //Handle the row selection event
            $.map(this.select(), function (item) {
                alert($(item).find('td').eq(0).text());
            });
        },
        columns: [
            {
                field: "AccountId",
                hidden: true
            }, {
                field: "Name",
                title: "Name"
            }, {
                field: "AccountNumber",
                title: "Account Number"
            }
        ],
        pageable: {
            buttonCount: 3
        }
    });
};

Xrm.KendoUIGridREST.GetContext = function () {
    /// <summary>
    /// Retrieves the CRM context information.
    /// </summary>
    /// <returns type="Object">The CRM context.</returns>

    var errorMessage = "Context is not available.";
    if (typeof GetGlobalContext != "undefined") {
        return GetGlobalContext();
    }
    else {
        if (typeof Xrm != "undefined") {
            return Xrm.Page.context;
        } else {
            throw new Error(errorMessage);
        }
    }
};