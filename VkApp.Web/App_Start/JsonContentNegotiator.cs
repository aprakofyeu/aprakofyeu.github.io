using System;
using System.Text;
using System.Web.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace VkApp.Web
{
    public class JsonCamel : JsonResult
    {
        public JsonCamel(object data)
            :this(data, JsonRequestBehavior.AllowGet)
        {
        }

        public JsonCamel(object data, JsonRequestBehavior jsonRequestBehavior)
        {
            Data = data;
            JsonRequestBehavior = jsonRequestBehavior;
        }

#pragma warning disable CS0108 // 'JsonCamel.ContentEncoding' hides inherited member 'JsonResult.ContentEncoding'. Use the new keyword if hiding was intended.
        public Encoding ContentEncoding { get; set; }
#pragma warning restore CS0108 // 'JsonCamel.ContentEncoding' hides inherited member 'JsonResult.ContentEncoding'. Use the new keyword if hiding was intended.

#pragma warning disable CS0108 // 'JsonCamel.ContentType' hides inherited member 'JsonResult.ContentType'. Use the new keyword if hiding was intended.
        public string ContentType { get; set; }
#pragma warning restore CS0108 // 'JsonCamel.ContentType' hides inherited member 'JsonResult.ContentType'. Use the new keyword if hiding was intended.

#pragma warning disable CS0108 // 'JsonCamel.Data' hides inherited member 'JsonResult.Data'. Use the new keyword if hiding was intended.
        public object Data { get; set; }
#pragma warning restore CS0108 // 'JsonCamel.Data' hides inherited member 'JsonResult.Data'. Use the new keyword if hiding was intended.

#pragma warning disable CS0108 // 'JsonCamel.JsonRequestBehavior' hides inherited member 'JsonResult.JsonRequestBehavior'. Use the new keyword if hiding was intended.
        public JsonRequestBehavior JsonRequestBehavior { get; set; }
#pragma warning restore CS0108 // 'JsonCamel.JsonRequestBehavior' hides inherited member 'JsonResult.JsonRequestBehavior'. Use the new keyword if hiding was intended.

        public override void ExecuteResult(ControllerContext context)
        {
            if (context == null)
            {
                throw new ArgumentNullException("context");
            }
            if (JsonRequestBehavior == JsonRequestBehavior.DenyGet && String.Equals(context.HttpContext.Request.HttpMethod, "GET", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("This request has been blocked because sensitive information could be disclosed to third party web sites when this is used in a GET request. To allow GET requests, set JsonRequestBehavior to AllowGet.");
            }

            var response = context.HttpContext.Response;

            response.ContentType = !String.IsNullOrEmpty(ContentType) ? ContentType : "application/json";
            if (ContentEncoding != null)
            {
                response.ContentEncoding = ContentEncoding;
            }
            if (Data == null)
                return;

            var jsonSerializerSettings = new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            };
            response.Write(JsonConvert.SerializeObject(Data, jsonSerializerSettings));
        }
    }
}