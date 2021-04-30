for (vote.length>0) 
        {
            table.listing-table.table-light
            thead.thead-dark
            tr
                th Name
                th Email
            each vote in votes
                tr
                    td= vote.name
                    td= vote.email
        }
        else
        {
            p No Votes yet :(
        }